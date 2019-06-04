package fr.sioc1981.versioning.backend.service;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Stream;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
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

import fr.sioc1981.versioning.backend.entity.IssueContainer;

@Path("/issueContainer")
@Stateless
public class IssueContainerService {

	Logger log = Logger.getLogger(IssueContainerService.class.getName());

	@Inject
	private EntityManager entityManager;

	@EJB
	private GlobalSSE globalSSE;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	public Response create(IssueContainer newIssueContainer) {
		log.info("create " + newIssueContainer);
		this.entityManager.persist(newIssueContainer);
		globalSSE.broadcast("issue_container_" + newIssueContainer.getId(), newIssueContainer);
		return Response.ok(newIssueContainer).build();
	}

	@PUT
	@Consumes("application/json")
	public Response update(IssueContainer newIssueContainer) {
		IssueContainer issueContainer = this.entityManager.merge(newIssueContainer);
		globalSSE.broadcast("issue_container_" + issueContainer.getId(), issueContainer);
		return Response.ok(issueContainer).build();
	}

	@GET
	@Produces("application/json")
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from IssueContainer").getResultList()).build();
	}

	@GET
	@Path("{id}")
	@Produces("application/json")
	public Response findById(@PathParam("id") String id) {
		List<IssueContainer> result = this.entityManager
				.createQuery("from IssueContainer where id = :id", IssueContainer.class).setParameter("id", id)
				.getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}
		return Response.ok(result.get(0)).build();
	}

	public void initialize() {
		try {
			Stream<IssueContainer> stream = this.entityManager.createQuery("from IssueContainer", IssueContainer.class)
					.getResultStream();
			stream.forEach(ic -> globalSSE.broadcast("issue_container_" + ic.getId(), ic));
		} catch (NoResultException nre) {
			//
		}
	}

}
