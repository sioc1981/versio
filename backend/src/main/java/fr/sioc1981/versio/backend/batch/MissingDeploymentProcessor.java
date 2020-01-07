/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import javax.batch.api.BatchProperty;
import javax.batch.api.chunk.ItemProcessor;
import javax.batch.runtime.context.JobContext;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;

import fr.sioc1981.versio.backend.entity.Patch;

/* Processor batch artifact.
 * Calculate the price of every call.
 */
@Dependent
@Named("MissingDeploymentProcessor")
public class MissingDeploymentProcessor implements ItemProcessor {
    
    @Inject
    @BatchProperty(name = "platform")
    private String platformName;
    
    @Inject
    JobContext jobCtx;
    String threshold;
    
    public MissingDeploymentProcessor() { }

    @Override
    public Object processItem(Object obj) throws Exception {
        Patch patch;
        /* Calculate the price of this call */
        threshold = jobCtx.getProperties().getProperty("deployment_duration_threshold");
        patch = (Patch) obj;
        Instant duration = Instant.now().minus(Duration.parse(threshold));
        if (checkDeploy(patch) && duration.isAfter(Instant.ofEpochMilli(getReferenceDate(patch).getTime()))) {
        	return obj;
        }
        return null;
    }

	private boolean checkDeploy(Patch patch) {
		Platform platform = Platform.valueOf(platformName); 
		
		boolean res = true;
		switch (platform) {
		case QUALIFICATION:
			res = !patch.getUndeployed();
			break;
		case KEY_USER:
			res = patch.getQualification().getUndeployDate() != null;
			break;
		case PILOT:
			res = patch.getKeyUser().getUndeployDate() != null;
			break;
		case PRODUCTION:
		default:
			res = patch.getPilot().getUndeployDate() != null;
			break;
		}
		
		return res;
	}

	private Date getReferenceDate(Patch patch) {
		Platform platform = Platform.valueOf(platformName); 
		
		Date res = null;
		switch (platform) {
		case QUALIFICATION:
			res = patch.getPackageDate();
			break;
		case KEY_USER:
			res = patch.getQualification().getValidationDate();
			break;
		case PILOT:
			res = patch.getKeyUser().getValidationDate();
			break;
		case PRODUCTION:
		default:
			res = patch.getPilot().getValidationDate();
			break;
		}
		
		return res;
	}
    
}
