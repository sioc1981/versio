/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.missing;

import java.util.Date;

import javax.enterprise.context.Dependent;
import javax.inject.Named;

import fr.sioc1981.versio.backend.entity.Patch;

/* Processor batch artifact.
 * Calculate the price of every call.
 */
@Dependent
@Named("MissingValidationProcessor")
public class MissingValidationProcessor  extends AbstractMissingProcessor {
    
    @Override
    protected boolean checkDeploy(Patch patch) {
		boolean res = true;
		switch (platform) {
		case QUALIFICATION:
			res = patch.getQualification().getUndeployDate() == null;
			break;
		case KEY_USER:
			res = patch.getKeyUser().getUndeployDate() == null;
			break;
		case PILOT:
			res = patch.getPilot().getUndeployDate() == null;
			break;
		case PRODUCTION:
		default:
			res = patch.getProduction().getUndeployDate() == null;
			break;
		}
		
		return res;
	}

    @Override
	protected Date getReferenceDate(Patch patch) {
		Date res = null;
		switch (platform) {
		case QUALIFICATION:
			res = patch.getQualification().getDeployDate();
			break;
		case KEY_USER:
			res = patch.getKeyUser().getDeployDate();
			break;
		case PILOT:
			res = patch.getPilot().getDeployDate();
			break;
		case PRODUCTION:
		default:
			res = patch.getProduction().getDeployDate();
			break;
		}
		return res;
	}

    @Override
	protected String getCheckName() {
		return "validation";
	}
    
}
