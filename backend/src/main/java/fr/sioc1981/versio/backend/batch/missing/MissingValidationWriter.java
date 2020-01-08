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

/* Writer artifact.
 * Write each bill to a text file.
 */
@Dependent
@Named("MissingValidationWriter")
public class MissingValidationWriter extends AbstractMissingWriter {

	@Override
	protected String getCheckName() {
		return "validation";
	}
    
}
