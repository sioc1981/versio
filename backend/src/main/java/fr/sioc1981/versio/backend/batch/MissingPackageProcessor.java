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
@Named("MissingPackageProcessor")
public class MissingPackageProcessor implements ItemProcessor {
    
    @Inject
    JobContext jobCtx;
    String threshold;
    
    public MissingPackageProcessor() { }

    @Override
    public Object processItem(Object obj) throws Exception {
        Patch patch;
        /* Calculate the price of this call */
        threshold = jobCtx.getProperties().getProperty("package_duration_threshold");
        patch = (Patch) obj;
        Instant duration = Instant.now().minus(Duration.parse(threshold));
        if (!patch.getUndeployed() && duration.isAfter(Instant.ofEpochMilli(patch.getBuildDate().getTime()))) {
        	return patch;
        }
        return null;
    }
    
}
