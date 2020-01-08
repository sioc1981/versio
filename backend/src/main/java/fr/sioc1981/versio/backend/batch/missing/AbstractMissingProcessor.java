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
import javax.batch.runtime.context.JobContext;
import javax.inject.Inject;

import fr.sioc1981.versio.backend.batch.data.MissingItem;
import fr.sioc1981.versio.backend.batch.data.Platform;
import fr.sioc1981.versio.backend.entity.Patch;

/* Processor batch artifact.
 * Calculate the price of every call.
 */
public abstract class AbstractMissingProcessor implements ItemProcessor {
    
    @Inject
    @BatchProperty(name = "platform")
    private String platformName;

	protected Platform platform;
    
	@Inject
    JobContext jobCtx;
    String threshold;
    
    public AbstractMissingProcessor() { }

    @Override
    public Object processItem(Object obj) throws Exception {
    	platform = Platform.valueOf(platformName);
        Patch patch;
        /* Calculate the price of this call */
        threshold = jobCtx.getProperties().containsKey(platform.getName() + "_"+getCheckName()+"_duration_threshold")
        		? jobCtx.getProperties().getProperty(platform.getName() + "_"+getCheckName()+"_duration_threshold")
                : jobCtx.getProperties().getProperty(getCheckName()+"_duration_threshold");
        patch = (Patch) obj;
        Duration duration = Duration.between(Instant.ofEpochMilli(getReferenceDate(patch).getTime()), Instant.now());
        Duration thresholdDuration = Duration.parse(threshold);
        if (checkDeploy(patch) && duration.compareTo(thresholdDuration) > 0) {
        	return new MissingItem(patch, null, duration);
        }
        return null;
    }


	protected abstract boolean checkDeploy(Patch patch);

	protected abstract Date getReferenceDate(Patch patch);
    
	protected abstract String getCheckName();
	
}
