package fr.sioc1981.versio.backend.service.admin;

import java.util.List;

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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.entity.batch.BatchOption;

@Path("/admin/batchOption")
@Stateless
public class BatchOptionService {

	Logger log = LoggerFactory.getLogger(BatchOptionService.class.getName());

	@Inject
	private EntityManager entityManager;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	public Response create(BatchOption newBatchOption) {
		log.info("create {}", newBatchOption);
		this.entityManager.persist(newBatchOption);
		BatchOption batchOption = this.entityManager.createQuery("from BatchOption where id = :id", BatchOption.class)
				.setParameter("id", newBatchOption.getId()).getSingleResult();
		return Response.ok(batchOption).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(BatchOption newBatchOption) {
		BatchOption application = this.entityManager.merge(newBatchOption);
		return Response.ok(application).build();
	}

	@GET
	@Produces("application/json")
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from BatchOption").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	public Long getCount() {
		Long count = this.entityManager.createQuery("select count(1) as count from BatchOption", Long.class)
				.getSingleResult();
		return count;
	}
	
	@GET
	@Path("{id}")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<BatchOption> result = this.entityManager.createQuery("from BatchOption where id = :id", BatchOption.class)
				.setParameter("id", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

}
