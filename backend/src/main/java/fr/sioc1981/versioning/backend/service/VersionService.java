package fr.sioc1981.versioning.backend.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
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
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versioning.backend.entity.Version;

@Path(VersionService.VERSION_PATH)
@Stateless
public class VersionService {

	static final String VERSION_PATH = "/version";

	private static final Logger LOG = LoggerFactory.getLogger(VersionService.class);

	@Inject
	private EntityManager entityManager;

	@EJB
	private GlobalSSE globalSSE;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	public Response create(Version newVersion) {
		LOG.warn("create " + newVersion);
		this.entityManager.persist(newVersion);
		URI uri = null;
		try {
			uri = new URI(VERSION_PATH + "/" + newVersion.getId());
			getCount();
		} catch (URISyntaxException e) {
			LOG.warn("Fail to create URI for new version {}", newVersion, e);
		}
		return Response.created(uri).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(Version newVersion) {
		return Response.ok(this.entityManager.merge(newVersion)).build();
	}

	@Path("{id}")
	@DELETE
	public Response delete(@PathParam("id") String id) {
		Version version = this.entityManager.find(Version.class, id);

		try {
			this.entityManager.remove(version);
			getCount();
		} catch (Exception e) {
			throw new RuntimeException("Could not delete version.", e);
		}

		return Response.ok().build();
	}

	@GET
	@Produces("application/json")
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from Version").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	public Long getCount() {
		Long count = this.entityManager.createQuery("select count(1) as count from Version", Long.class)
				.getSingleResult();
		globalSSE.broadcast("version", count);
		return count;
	}

	@GET
	@Produces("application/json")
	@Path("/comparison")
	public Response compare(@QueryParam("source") String source, @QueryParam("dest") String dest) {
		Version v1 = new Version(source);
		Version v2 = new Version(dest);

		final Version baseVersion = new Version(findVersionBase(v1, v2));
		Map<String, List<Version>> result = new HashMap<>();
		result.put("sourceVersions", findAllBetween(baseVersion, v1));
		result.put("destVersions", findAllBetween(baseVersion, v2));
		return Response.ok(result).build();
	}

	private List<Version> findAllBetween(Version baseVersion, Version v1) {
		if (baseVersion.equals(v1)) {
			return Collections.emptyList();
		}

		String qlString = "SELECT v FROM Version v where v.baseNumber = :baseNumber and v.interimNumber = :interimNumber and ";
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
		params.put("featureNumber", v1.getFeatureNumber());
		if (v1.getPatchNumber() != 0) {
			int basePatch = baseVersion.getPatchNumber();
			if (featureSearch) {
				qlString += " OR ";
				basePatch = 0;
			}
			qlString += "(v.featureNumber = :featureNumber and v.patchNumber BETWEEN :basePatchNumber AND :versionPatchNumber)";
			params.put("basePatchNumber", basePatch);
			params.put("versionPatchNumber", v1.getPatchNumber());
		}
		LOG.warn("create : {}", qlString);
		TypedQuery<Version> query = this.entityManager.createQuery(qlString, Version.class);
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

	@GET
	@Path("{id}")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<Version> result = this.entityManager.createQuery("from Version where id = :id", Version.class)
				.setParameter("id", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

}
