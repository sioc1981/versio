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
import java.util.Date;

import javax.batch.api.BatchProperty;
import javax.batch.api.chunk.ItemProcessor;
import javax.inject.Inject;

import fr.sioc1981.versio.backend.batch.options.OptionLoader;
import fr.sioc1981.versio.backend.entity.Patch;
import fr.sioc1981.versio.backend.entity.batch.MissingPatch;
import fr.sioc1981.versio.backend.entity.batch.Platform;
import fr.sioc1981.versio.backend.entity.batch.ProcessStep;

/* Processor batch artifact.
 * Calculate the price of every call.
 */
public abstract class AbstractMissingProcessor implements ItemProcessor {
    
    @Inject
    @BatchProperty(name = "platform")
    private String platformName;

	protected Platform platform;
    
	@Inject
	OptionLoader optionLoader;
	
    String threshold;
    
    public AbstractMissingProcessor() { }

    @Override
    public Object processItem(Object obj) throws Exception {
    	platform = Platform.valueOf(platformName);
        Patch patch;
        /* Calculate the price of this call */
        threshold = optionLoader.containsOption(platform.getName() + "_" + getProcessStep().getName() + "_duration_threshold")
        		? optionLoader.loadOption(platform.getName() + "_" + getProcessStep().getName() + "_duration_threshold")
                : optionLoader.loadOption(getProcessStep().getName() + "_duration_threshold");
        patch = (Patch) obj;
        Duration duration = Duration.between(Instant.ofEpochMilli(getReferenceDate(patch).getTime()), Instant.now());
        Duration thresholdDuration = Duration.parse(threshold);
        if (checkDeploy(patch) && duration.compareTo(thresholdDuration) > 0) {
        	return new MissingPatch(patch, platform, getProcessStep(), duration);
        }
        return null;
    }


	protected abstract boolean checkDeploy(Patch patch);

	protected abstract Date getReferenceDate(Patch patch);
    
	protected abstract ProcessStep getProcessStep();
	
}
