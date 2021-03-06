/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.missing;

import javax.enterprise.context.Dependent;
import javax.inject.Named;

import fr.sioc1981.versio.backend.entity.batch.ProcessStep;

/* Writer artifact.
 * Write each bill to a text file.
 */
@Dependent
@Named("MissingDeploymentWriter")
public class MissingDeploymentWriter extends AbstractMissingWriter {

	@Override
	protected ProcessStep getProcessStep() {
		return ProcessStep.DEPLOYMENT;
	}

}
