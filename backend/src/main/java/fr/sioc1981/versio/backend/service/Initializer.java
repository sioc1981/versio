package fr.sioc1981.versio.backend.service;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.entity.batch.BatchOption;
import fr.sioc1981.versio.backend.service.admin.ApplicationUserService;
import fr.sioc1981.versio.backend.service.admin.IssueContainerService;

@Startup
@Singleton
public class Initializer {

	private static final Logger LOG = LoggerFactory.getLogger(Initializer.class);

	@EJB
	private IssueService issueService;
	
	@EJB
	private IssueContainerService issueContainerService;
	
	@EJB
	private PatchService patchService;
	
	@EJB
	private ReleaseService releaseService;
	
	@EJB
	private ApplicationUserService applicationUserService;
	
	@Inject
	private EntityManager entityManager;
	
	@PostConstruct
	public void init() {
		LOG.info("Initialize default batch options");
		initBatchOptions();
		LOG.info("Initialize services");
		issueContainerService.initialize();
		issueService.getCount();
		patchService.getCount();
		releaseService.getCount();
		releaseService.getSummary();
		applicationUserService.getCount();
		applicationUserService.getSummary();
	}
	
	private void initBatchOptions() {
		addMissingBatchOption("package_duration_threshold","P2D");
		addMissingBatchOption("deployment_duration_threshold","P2D");
		addMissingBatchOption("validation_duration_threshold","P2D");
	}

	private void addMissingBatchOption(String key, String value) {
		TypedQuery<BatchOption> query = entityManager.createQuery("select bo from BatchOption bo where bo.key = :key", BatchOption.class);
		query.setParameter("key", key);
		if (query.getResultList().isEmpty()) {
			BatchOption bo = new BatchOption();
			bo.setKey(key);
			bo.setValue(value);
			entityManager.persist(bo);
			LOG.info("Add missing batch option with default values: {}", bo);
		}
	}
	
}
