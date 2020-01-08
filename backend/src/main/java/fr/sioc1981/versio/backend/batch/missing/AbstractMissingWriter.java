/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.missing;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.Serializable;
import java.time.Duration;
import java.util.List;

import javax.batch.api.BatchProperty;
import javax.batch.api.chunk.ItemWriter;
import javax.batch.runtime.context.JobContext;
import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.batch.data.MissingItem;
import fr.sioc1981.versio.backend.batch.data.Platform;
import fr.sioc1981.versio.backend.entity.Patch;

/* Writer artifact.
 * Write each bill to a text file.
 */
public abstract class AbstractMissingWriter implements ItemWriter {
	
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	
    @Inject
    @BatchProperty(name = "platform")
    private String platformName;
    
    private Platform platform;

    @Inject
    JobContext jobCtx;
    
	private File file;
    
    @Override
    public void open(Serializable ckpt) throws Exception {
    	platform = Platform.valueOf(platformName);
    	String dirPath = jobCtx.getProperties().getProperty("outputDir", ".");
    	File dir = new File(dirPath);
    	dir.mkdirs();
    	file = new File(dir, "missing_" + getCheckName() + "_" + platform.getName() + ".txt");
    	file.delete();
    }

    @Override
    public void close() throws Exception { }

    @Override
    public void writeItems(List<Object> list) throws Exception {
    	log.info("Detect {} missing patches on {}", list.size(), platform.getName());
    	FileWriter fwriter = new FileWriter(file);
    	try (BufferedWriter bwriter = new BufferedWriter(fwriter)) {
    		bwriter.write("Missing ");
    		bwriter.write(getCheckName());
    		bwriter.write(" on ");
    		bwriter.write(platform.getName());
    		bwriter.newLine();
    		bwriter.write(" ");
    		bwriter.newLine();
    		for (Object missingItemObject : list) {
    			MissingItem missingItem = (MissingItem) missingItemObject;
    			Patch patch = missingItem.getPatch();
                bwriter.write(String.format("%s - %s: since %s", 
                		patch.getRelease().getVersion().getVersionNumber(),
                		patch.getSequenceNumber(),
                		printDuration(missingItem.getDuration())
                		));
                bwriter.newLine();
            }
        }
    }

    private String printDuration(Duration duration) {
    	long nbDays = duration.toDaysPart();
    	if (nbDays == 0) {
    		return duration.toString();
    	}
    	return "P" + duration.toDaysPart() + "D";
	}

	@Override
    public Serializable checkpointInfo() throws Exception {
        return new ItemNumberCheckpoint();
    }
    
	protected abstract String getCheckName();
}
