package fr.sioc1981.versioning.backend.service;

import java.util.List;
import java.util.logging.Logger;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import fr.sioc1981.versioning.backend.entity.Application;

@Path("/application")
@Stateless
public class ApplicationService {

	Logger log = Logger.getLogger(ApplicationService.class.getName());

	@Inject
	private EntityManager entityManager;

	@EJB
	private GlobalSSE globalSSE;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	public Response create(Application newApplication) {
		log.warning("create " + newApplication);
		this.entityManager.persist(newApplication);

		getCount();
		return Response.ok(newApplication).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(Application newApplication) {
		Application application = this.entityManager.merge(newApplication);
		return Response.ok(application).build();
	}

	@GET
	@Produces("application/json")
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from Application").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	public Long getCount() {
		Long count = this.entityManager.createQuery("select count(1) as count from Application", Long.class)
				.getSingleResult();
		globalSSE.broadcast("application_count", count);
		return count;
	}

	@GET
	@Path("{id}")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<Application> result = this.entityManager.createQuery("from Application where id = :id", Application.class)
				.setParameter("id", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

}
