/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.notify.email;

import javax.batch.api.chunk.ItemProcessor;
import javax.batch.runtime.context.JobContext;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;

/* Processor batch artifact.
 * Calculate the price of every call.
 */
@Dependent
@Named("EmailNotifierProcessor")
public class EmailNotifierProcessor implements ItemProcessor {
    
    @Inject
    JobContext jobCtx;
    String threshold;
    
    public EmailNotifierProcessor() { }

    @Override
    public Object processItem(Object obj) throws Exception {
        return obj;
    }
    
}
