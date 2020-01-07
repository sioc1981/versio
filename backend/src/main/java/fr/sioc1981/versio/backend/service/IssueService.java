package fr.sioc1981.versio.backend.service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Stream;

import javax.annotation.security.DeclareRoles;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.sse.Sse;
import javax.ws.rs.sse.SseEventSink;

import org.jboss.ejb3.annotation.SecurityDomain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.data.IssueExtended;
import fr.sioc1981.versio.backend.data.IssueReleaseComparisonParam;
import fr.sioc1981.versio.backend.data.IssueReleaseComparisonResultItem;
import fr.sioc1981.versio.backend.entity.Issue;
import fr.sioc1981.versio.backend.entity.Patch;
import fr.sioc1981.versio.backend.entity.Release;
import fr.sioc1981.versio.backend.security.Security;

@Path("/issue")
@Stateless
@SecurityDomain(Security.Domain.DOMAIN)
@DeclareRoles({Security.Role.BACKEND, Security.Role.USER})
public class IssueService {

	private static final Logger LOG = LoggerFactory.getLogger(IssueService.class);

	@Context
	private Sse sse;

	@PersistenceContext
	private EntityManager entityManager;
	
	@EJB
	private GlobalSSE globalSSE;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	@RolesAllowed(Security.Role.USER)
	public Response create(Issue newIssue) {
		this.entityManager.persist(newIssue);
		getCount();
		return Response.ok(newIssue).build();
	}

	@PUT
	@Consumes("application/json")
	@RolesAllowed(Security.Role.USER)
	public Response update(Issue newIssue) {
		return Response.ok(this.entityManager.merge(newIssue)).build();
	}

	@GET
	@Produces("application/json")
	@PermitAll
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from Issue").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	@RolesAllowed(Security.Role.BACKEND)
	public Long getCount() {
		Long count = this.entityManager.createQuery("select count(1) as count from Issue", Long.class)
				.getSingleResult();
		globalSSE.broadcast("issue_count", count);
		return count;
	}

	@GET
	@Path("/search/releasecomparison")
	@Produces(MediaType.SERVER_SENT_EVENTS)
	@PermitAll
	public void search(final @Context SseEventSink eventSink) {
		LOG.info("parameters: {}", request.getParameterMap());
		HashSet<String> versions = new HashSet<>();
		HashSet<String> patchedVersions = new HashSet<>();
		IssueReleaseComparisonParam comparison = IssueReleaseComparisonParam.valueOf(request.getParameter("q"));
		if (comparison != null) {
			if (comparison.getSourceReleases() != null && !comparison.getSourceReleases().isEmpty()) {
				versions.addAll(comparison.getSourceReleases());
				patchedVersions.add(comparison.getSourceReleases().get(comparison.getSourceReleases().size() - 1));
			}
			if (comparison.getDestReleases() != null && !comparison.getDestReleases().isEmpty()) {
				versions.addAll(comparison.getDestReleases());
				patchedVersions.add(comparison.getDestReleases().get(comparison.getDestReleases().size() - 1));
			}
		}

		for (final String versionNumber : versions) {
			Stream<Issue> result = this.entityManager.createQuery(
					"select i from ReleaseFull rf join rf.issues i where rf.release.version.versionNumber = :versionNumber",
					Issue.class).setParameter("versionNumber", versionNumber).getResultStream();

			result.map(issue -> this.createIssueReleaseComparisonResultItem(issue, versionNumber, null))
					.forEach(ircri -> eventSink.send(
							sse.newEventBuilder().data(ircri).mediaType(MediaType.APPLICATION_JSON_TYPE).build()));
		}

		for (final String versionNumber : patchedVersions) {
			@SuppressWarnings("unchecked")
			Stream<Object[]> result = this.entityManager.createQuery(
					"select i, p.sequenceNumber from Patch p join p.issues i where p.release.version.versionNumber = :versionNumber")
					.setParameter("versionNumber", versionNumber).getResultStream();

			result.map(issue -> this.createIssueReleaseComparisonResultItem((Issue) issue[0], versionNumber,
					(String) issue[1]))
					.forEach(ircri -> eventSink.send(
							sse.newEventBuilder().data(ircri).mediaType(MediaType.APPLICATION_JSON_TYPE).build()));
		}

		eventSink.close();
	}

	@GET
	@Path("/{id}/full")
	@Produces("application/json")
	@PermitAll
	public Response findRelatedById(@PathParam("id") String id) {
		List<Issue> result = this.entityManager.createQuery("from Issue where reference = :reference", Issue.class)
				.setParameter("reference", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}
		
		IssueExtended issueExtended = new IssueExtended();
		issueExtended.setIssueReference(id);
		issueExtended.setIssue(result.get(0));
		
		List<Release> releaseResult = this.entityManager.createQuery(
				"select rf.release from ReleaseFull rf join rf.issues i where i.reference = :reference",
				Release.class).setParameter("reference", id).getResultList();
		issueExtended.setReleases(releaseResult);

		List<Patch> patchResult = this.entityManager.createQuery(
				"select p from Patch p join p.issues i where i.reference = :reference",
				Patch.class).setParameter("reference", id).getResultList();
		issueExtended.setPatches(patchResult);
		
		return Response.ok(issueExtended).build();
	}

	@GET
	@Path("/{id}")
	@Produces("application/json")
	@PermitAll
	public Response findById(@PathParam("id") String id) {
		List<Issue> result = this.entityManager.createQuery("from Issue where reference = :reference", Issue.class)
				.setParameter("reference", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

	private IssueReleaseComparisonResultItem createIssueReleaseComparisonResultItem(final Issue issue,
			final String versionNumber, String patchSequence) {
		LOG.info("createIssueReleaseComparisonResultItem({},{},{})", issue.getReference(), versionNumber,
				patchSequence);
		IssueReleaseComparisonResultItem res = new IssueReleaseComparisonResultItem();
		res.setIssue(issue);
		res.setIssueReference(issue.getReference());
		res.setReleaseVersion(versionNumber);
		res.setPatchSequence(patchSequence);
		return res;
	}
	

}
