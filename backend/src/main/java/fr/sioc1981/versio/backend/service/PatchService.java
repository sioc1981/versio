package fr.sioc1981.versio.backend.service;

import java.util.List;
import java.util.logging.Logger;

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
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.jboss.ejb3.annotation.SecurityDomain;

import fr.sioc1981.versio.backend.entity.Patch;
import fr.sioc1981.versio.backend.security.Security;

@Path("/patch")
@Stateless
@DeclareRoles({Security.Role.BACKEND, Security.Role.USER})
public class PatchService {

	Logger log = Logger.getLogger(PatchService.class.getName());

	@PersistenceContext
	private EntityManager entityManager;

	@EJB
	private GlobalSSE globalSSE;

	@EJB
	private ReleaseService releaseService;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	@RolesAllowed(Security.Role.USER)
	public Response create(Patch newPatch) {
		log.warning("create " + newPatch);
		this.entityManager.persist(newPatch);

		getCount();
		releaseService.getSummary(newPatch.getRelease().getId());
		return Response.ok(newPatch).build();
	}

	@PUT
	@Consumes("application/json")
	@RolesAllowed(Security.Role.USER)
	public Response update(Patch newPatch) {
		Patch patch = this.entityManager.merge(newPatch);
		releaseService.getSummary(newPatch.getRelease().getId());
		return Response.ok(patch).build();
	}

	@GET
	@Produces("application/json")
	@PermitAll
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from Patch").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	@RolesAllowed(Security.Role.BACKEND)
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	@RolesAllowed(Security.Role.BACKEND)
	public Long getCount() {
		Long count = this.entityManager.createQuery("select count(1) as count from Patch", Long.class)
				.getSingleResult();
		globalSSE.broadcast("patch_count", count);
		return count;
	}

	@GET
	@Path("search/{versionNumber}/{sequenceNumber}")
	@Produces("application/json")
	@PermitAll
	public Response searchPatch(@PathParam("versionNumber") String versionNumber,
			@PathParam("sequenceNumber") String sequenceNumber) {
		List<Patch> result = this.entityManager.createQuery(
				"from Patch p where p.sequenceNumber = :sequenceNumber AND p.release.version.versionNumber = :versionNumber",
				Patch.class).setParameter("versionNumber", versionNumber).setParameter("sequenceNumber", sequenceNumber)
				.getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

	@GET
	@Path("{id}")
	@Produces("application/json")
	@PermitAll
	public Response findById(@PathParam("id") String id) {
		List<Patch> result = this.entityManager.createQuery("from Patch where id = :id", Patch.class)
				.setParameter("id", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

}
