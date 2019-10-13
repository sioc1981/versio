package fr.sioc1981.versio.backend.service;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Singleton;
import javax.ejb.Startup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
	
	@PostConstruct
	public void init() {
		LOG.info("Initialize services");
		issueContainerService.initialize();
		issueService.getCount();
		patchService.getCount();
		releaseService.getCount();
		releaseService.getSummary();
		applicationUserService.getCount();
		applicationUserService.getSummary();
	}
	
}
