package fr.sioc1981.versioning.backend.service;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Singleton;
import javax.ejb.Startup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Startup
@Singleton
public class Initializer {

	private static final Logger LOG = LoggerFactory.getLogger(Initializer.class);

	@EJB
	private IssueService issueService;
	
	@EJB
	private PatchService patchService;
	
	@EJB
	private ReleaseService releaseService;
	
	@PostConstruct
	public void init() {
		LOG.info("Initialize services");
		issueService.getCount();
		patchService.getCount();
		releaseService.getCount();
		releaseService.getSummary();
	}
	
}
