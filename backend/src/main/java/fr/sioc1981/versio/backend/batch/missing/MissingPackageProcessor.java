/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.missing;

import java.time.Duration;
import java.time.Instant;

import javax.batch.api.chunk.ItemProcessor;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;

import fr.sioc1981.versio.backend.batch.options.OptionLoader;
import fr.sioc1981.versio.backend.entity.Patch;
import fr.sioc1981.versio.backend.entity.batch.MissingPatch;
import fr.sioc1981.versio.backend.entity.batch.ProcessStep;

/* Processor batch artifact.
 * Calculate the price of every call.
 */
@Dependent
@Named("MissingPackageProcessor")
public class MissingPackageProcessor implements ItemProcessor {
	
    @Inject
    OptionLoader optionLoader;
    
    String threshold;
    
    public MissingPackageProcessor() { }

    @Override
    public Object processItem(Object obj) throws Exception {
        Patch patch;
        /* Calculate the price of this call */
        threshold = optionLoader.loadOption("package_duration_threshold");
        patch = (Patch) obj;
        Duration duration = Duration.between(Instant.ofEpochMilli(patch.getBuildDate().getTime()), Instant.now());
        Duration thresholdDuration = Duration.parse(threshold);
        if (!patch.getUndeployed() && duration.compareTo(thresholdDuration) > 0) {
        	return new MissingPatch(patch, null, ProcessStep.PACKAGE, duration);
        }
        return null;
    }
    
}
