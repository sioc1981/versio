/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch;

import javax.enterprise.context.Dependent;
import javax.inject.Named;

import fr.sioc1981.versio.backend.batch.data.Platform;

/* Reader batch artifact.
 * Reads bills from the entity manager.
 * This artifact is in a partitioned step.
 */
@Dependent
@Named("MissingDeploymentReader")
public class MissingDeploymentReader extends AbstractMissingReader {

	@Override
	protected String getCheckColumn() {
		return "p." + platform.getName() + ".deployDate";
	}
	
    @Override
    protected String getReferenceColumn() {
    	if(platform == Platform.QUALIFICATION)
    		return "p.packageDate";
    	
		return "p." + platform.getPreviousPlatform().getName() + ".validationDate";
	}


}
