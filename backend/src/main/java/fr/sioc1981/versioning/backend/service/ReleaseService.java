package fr.sioc1981.versioning.backend.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

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
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versioning.backend.entity.Release;
import fr.sioc1981.versioning.backend.entity.ReleaseFull;

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
		} catch (URISyntaxException e) {
			LOG.warn("Fail to create URI for new release {}", newRelease, e);
		}
		return Response.created(uri).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(ReleaseFull newRelease) {
		return Response.ok(this.entityManager.merge(newRelease)).build();
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
		return Response.ok(getCount()).build();
	}

	public Long getCount() {
		Long count =  this.entityManager.createQuery("select count(1) as count from Release", Long.class).getSingleResult();
		globalSSE.broadcast("release", count);
		return count;
	}
	@GET
	@Path("{id}")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<Release> result = this.entityManager.createQuery("from ReleaseFull where release = :id", Release.class)
				.setParameter("id", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

}
