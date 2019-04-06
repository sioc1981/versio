package fr.sioc1981.versioning.backend.service;

import java.util.List;
import java.util.logging.Logger;

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

import fr.sioc1981.versioning.backend.entity.Patch;

@Path("/patch")
@Stateless
public class PatchService {

	Logger log = Logger.getLogger(PatchService.class.getName());
	
	@Inject
	private EntityManager entityManager;

	@EJB
	private GlobalSSE globalSSE; 

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	public Response create(Patch newPatch) {
		log.warning("create " + newPatch);
		this.entityManager.persist(newPatch);
		
		getCount();
		return Response.ok(newPatch).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(Patch newPatch) {
		return Response.ok(this.entityManager.merge(newPatch)).build();
	}

	@Path("{id}")
	@DELETE
	public Response delete(@PathParam("id") String id) {
		Patch patch = this.entityManager.find(Patch.class, id);

		try {
			this.entityManager.remove(patch);
			getCount();
		} catch (Exception e) {
			throw new RuntimeException("Could not delete patch.", e);
		}

		return Response.ok().build();
	}

	@GET
	@Produces("application/json")
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from Patch").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	public Long getCount() {
		Long count =  this.entityManager.createQuery("select count(1) as count from Patch", Long.class).getSingleResult();
		globalSSE.broadcast("patch", count);
		return count;
	}
	@GET
	@Path("{id}")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<Patch> result = this.entityManager.createQuery("from Patch where reference = :reference", Patch.class)
				.setParameter("reference", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

}
