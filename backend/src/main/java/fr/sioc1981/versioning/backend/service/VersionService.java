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
			uri = new URI(VERSION_PATH + "/" + newVersion.getId() );
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
		Long count =  this.entityManager.createQuery("select count(1) as count from Version", Long.class).getSingleResult();
		globalSSE.broadcast("version", count);
		return count;
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
