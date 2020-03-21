/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.missing;

import javax.enterprise.context.Dependent;
import javax.inject.Named;

import fr.sioc1981.versio.backend.entity.batch.Platform;

/* Reader batch artifact.
 * Reads bills from the entity manager.
 * This artifact is in a partitioned step.
 */
@Dependent
@Named("MissingValidationReader")
public class MissingValidationReader extends AbstractMissingReader {

	@Override
	protected String getCheckColumn() {
		return "p." + platform.getName() + ".validationDate";
	}

	@Override
	protected String getReferenceColumn() {
		return "p." + platform.getName() + ".deployDate";
	}

	@Override
	protected String getNextStepColumn() {
		if(platform == Platform.PRODUCTION)
    		return null;
    	
		return "p." + platform.getNextPlatform().getName() + ".validationDate";
	}

}
