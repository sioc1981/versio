package fr.sioc1981.versioning.backend.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versioning.backend.entity.PlatformCount;
import fr.sioc1981.versioning.backend.entity.Release;
import fr.sioc1981.versioning.backend.entity.ReleaseFull;
import fr.sioc1981.versioning.backend.entity.ReleaseFullSummary;
import fr.sioc1981.versioning.backend.entity.Version;

@Path(ReleaseService.RELEASE_PATH)
@Stateless
public class ReleaseService {
	
	static final String RELEASE_PATH = "/release";

	private static final Logger LOG = LoggerFactory.getLogger(ReleaseService.class);
	@Inject
	private EntityManager entityManager;
	
	@EJB
	private GlobalSSE globalSSE; 

	@Context
	private HttpServletRequest request;
	

	@POST
	@Consumes("application/json")
	public Response create(ReleaseFull newRelease) {
		LOG.warn("create " + newRelease);
		this.entityManager.persist(newRelease);
		URI uri = null;
		try {
			uri = new URI(RELEASE_PATH + "/" /* + newRelease.getRelease().getRelease().getId()*/);
			getCount();
			getSummary(newRelease.getId());
		} catch (URISyntaxException e) {
			LOG.warn("Fail to create URI for new release {}", newRelease, e);
		}
		return Response.created(uri).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(ReleaseFull newRelease) {
		ReleaseFull updatedRelease = this.entityManager.merge(newRelease);
		getSummary(updatedRelease.getId());
		return Response.ok(updatedRelease).build();
	}

	@Path("{id}")
	@DELETE
	public Response delete(@PathParam("id") String id) {
		Release release = this.entityManager.find(Release.class, id);

		try {
			this.entityManager.remove(release);
			getCount();
			
		} catch (Exception e) {
			throw new RuntimeException("Could not delete release.", e);
		}

		return Response.ok().build();
	}

	@GET
	@Produces("application/json")
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from Release r").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/full")
	public Response findAllFull() {
		return Response.ok(this.entityManager.createQuery("from ReleaseFull r").getResultList()).build();
	}
	
	
	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getSummary()).build();
	}

	public Long getCount() {
		Long count =  this.entityManager.createQuery("select count(1) as count from Release", Long.class).getSingleResult();
		globalSSE.broadcast("release_count", count);
		return count;
	}
	
	@GET
	@Produces("application/json")
	@Path("{id}/summary")
	public Response summarize(@PathParam("id") long id) {
		try {
			return Response.ok(getSummary(id)).build();
		} catch (NoResultException e) {
			return Response.status(Status.NOT_FOUND).build();
		}
	}
	
	public ReleaseFullSummary getSummary(long id) throws NoResultException {
		Object[] res = (Object[]) this.entityManager.createNamedQuery("releaseFullSummaryById").setParameter("id", id).getSingleResult();
		return convert(res);
	}
	
	public List<ReleaseFullSummary> getSummary() throws NoResultException {
		Stream<?> stream = this.entityManager.createNamedQuery("releaseFullSummary").getResultStream();
		return stream.map(o -> (Object[]) o).map(this::convert).collect(Collectors.toList());
	}
	
	private ReleaseFullSummary convert(Object[] res) {
		ReleaseFullSummary releaseFullSummary = (ReleaseFullSummary) res[0];
		releaseFullSummary.setQualification((PlatformCount) res[1]);
		releaseFullSummary.setKeyUser((PlatformCount) res[2]);
		releaseFullSummary.setPilot((PlatformCount) res[3]);
		releaseFullSummary.setProduction((PlatformCount) res[4]);
		globalSSE.broadcast("release_summary_"+releaseFullSummary.getId(), releaseFullSummary);
		return releaseFullSummary;
	}

	@GET
	@Path("{id}/full")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<Release> result = this.entityManager.createQuery("from ReleaseFull where release = :id", Release.class)
				.setParameter("id", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}
	
	@GET
	@Produces("application/json")
	@Path("{source}/compare/{dest}")
	public Response compare(@PathParam("source") String source, @PathParam("dest") String dest) {
		Version v1 = new Version(source);
		Version v2 = new Version(dest);

		final Version baseVersion = new Version(findVersionBase(v1, v2));
		Map<String, List<Release>> result = new HashMap<>();
		result.put("sourceReleases", findAllBetween(baseVersion, v1));
		result.put("destReleases", findAllBetween(baseVersion, v2));
		return Response.ok(result).build();
	}

	public List<Release> findAllBetween(Version baseVersion, Version v1) {
		if (baseVersion.equals(v1)) {
			return Collections.emptyList();
		}

		String qlString = "SELECT r FROM Release r join fetch r.version v where v.baseNumber = :baseNumber and v.interimNumber = :interimNumber and ";
		HashMap<String, Integer> params = new HashMap<String, Integer>();
		params.put("baseNumber", baseVersion.getBaseNumber());
		params.put("interimNumber", baseVersion.getInterimNumber());
		boolean featureSearch = false;
		int compare = baseVersion.getFeatureNumber() - v1.getFeatureNumber();
		if (compare != 0) {
			qlString += "(v.featureNumber BETWEEN :baseFeatureNumber AND :versionFeatureNumber and v.patchNumber = 0)";
			params.put("baseFeatureNumber", baseVersion.getFeatureNumber());
			params.put("versionFeatureNumber", v1.getFeatureNumber());
			featureSearch = true;
		}
		if (v1.getPatchNumber() != 0) {
			params.put("featureNumber", v1.getFeatureNumber());
			int basePatch = baseVersion.getPatchNumber();
			if (featureSearch) {
				qlString += " OR ";
				basePatch = 0;
			}
			qlString += "(v.featureNumber = :featureNumber and v.patchNumber BETWEEN :basePatchNumber AND :versionPatchNumber)";
			params.put("basePatchNumber", basePatch);
			params.put("versionPatchNumber", v1.getPatchNumber());
		}
		qlString += " order by v.versionNumber";
		TypedQuery<Release> query = this.entityManager.createQuery(qlString, Release.class);
		params.forEach((name, value) -> query.setParameter(name, value));
		return query.getResultList();
	}

	private String findVersionBase(Version v1, Version v2) {
		StringBuilder base = new StringBuilder();
		int compare = v1.getBaseNumber() - v2.getBaseNumber();
		if (compare != 0) {
			return String.valueOf(Math.min(v1.getBaseNumber(), v2.getBaseNumber()));
		}
		base.append(v1.getBaseNumber());
		base.append(".");
		compare = v1.getInterimNumber() - v2.getInterimNumber();
		if (compare != 0) {
			return base.toString() + String.valueOf(Math.min(v1.getInterimNumber(), v2.getInterimNumber()));
		}
		base.append(v1.getInterimNumber());
		base.append(".");
		compare = v1.getFeatureNumber() - v2.getFeatureNumber();
		if (compare != 0) {
			return base.toString() + String.valueOf(Math.min(v1.getFeatureNumber(), v2.getFeatureNumber()));
		}
		base.append(v1.getFeatureNumber());
		base.append(".");
		base.append(Math.min(v1.getPatchNumber(), v2.getPatchNumber()));
		return base.toString().replaceAll("(\\.0)+$", "");
	}


}
