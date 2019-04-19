package fr.sioc1981.versioning.backend.service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Stream;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.sse.Sse;
import javax.ws.rs.sse.SseEventSink;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versioning.backend.data.IssueReleaseComparisonParam;
import fr.sioc1981.versioning.backend.data.IssueReleaseComparisonResultItem;
import fr.sioc1981.versioning.backend.entity.Issue;

@Path("/issue")
@Stateless
public class IssueService {

	private static final Logger LOG = LoggerFactory.getLogger(IssueService.class);

	@Context
	private Sse sse;

	@Inject
	private EntityManager entityManager;

	@EJB
	private GlobalSSE globalSSE;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	public Response create(Issue newIssue) {
		this.entityManager.persist(newIssue);
		getCount();
		return Response.ok(newIssue).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(Issue newIssue) {
		return Response.ok(this.entityManager.merge(newIssue)).build();
	}

	@Path("{id}")
	@DELETE
	public Response delete(@PathParam("id") String id) {
		Issue issue = this.entityManager.find(Issue.class, id);

		try {
			this.entityManager.remove(issue);
			getCount();
		} catch (Exception e) {
			throw new RuntimeException("Could not delete issue.", e);
		}

		return Response.ok().build();
	}

	@GET
	@Produces("application/json")
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from Issue").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	public Long getCount() {
		Long count = this.entityManager.createQuery("select count(1) as count from Issue", Long.class)
				.getSingleResult();
		globalSSE.broadcast("issue_count", count);
		return count;
	}

	@GET
	@Produces("application/json")
	@Path("/test")
	public Response summarize(@QueryParam("q") String q) {
		LOG.warn("parameters: {}",request.getParameterMap());
		LOG.warn("q: {}", q);
		return Response.ok().build();
	}

	@GET
	@Path("/search/releasecomparison")
	@Produces(MediaType.SERVER_SENT_EVENTS)
	public void search(final @Context SseEventSink eventSink) {
		LOG.warn("parameters: {}",request.getParameterMap());
		LOG.warn("q: {}",request.getParameter("q"));
		HashSet<String> versions = new HashSet<>();
		IssueReleaseComparisonParam comparison = IssueReleaseComparisonParam.valueOf(request.getParameter("q"));
		if(comparison != null) {
			versions.addAll(comparison.getSourceReleases());
			versions.addAll(comparison.getDestReleases());
		}

		for (final String versionNumber : versions) {
			Stream<Issue> result = this.entityManager
					.createQuery("select i from ReleaseFull rf join rf.issues i where rf.release.version.versionNumber = :versionNumber", Issue.class)
					.setParameter("versionNumber", versionNumber).getResultStream();

			result.map(issue -> this.createIssueReleaseComparisonResultItem(issue, versionNumber)).forEach(
					ircri -> eventSink.send(sse.newEventBuilder().data(ircri).mediaType(MediaType.APPLICATION_JSON_TYPE).build()));
		}

		eventSink.close();
	}

	@GET
	@Path("/{id}")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<Issue> result = this.entityManager.createQuery("from Issue where reference = :reference", Issue.class)
				.setParameter("reference", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

	private IssueReleaseComparisonResultItem createIssueReleaseComparisonResultItem(final Issue issue,
			final String versionNumber) {
		IssueReleaseComparisonResultItem res = new IssueReleaseComparisonResultItem();
		res.setIssue(issue);
		res.setIssueReference(issue.getReference());
		res.setReleaseVersion(versionNumber);
		return res;
	}
}
