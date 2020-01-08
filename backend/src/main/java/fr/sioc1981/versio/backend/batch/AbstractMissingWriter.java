/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.Serializable;
import java.time.Duration;
import java.util.List;

import javax.batch.api.BatchProperty;
import javax.batch.api.chunk.ItemWriter;
import javax.inject.Inject;

import fr.sioc1981.versio.backend.entity.Patch;

/* Writer artifact.
 * Write each bill to a text file.
 */
public abstract class AbstractMissingWriter implements ItemWriter {
	
    @Inject
    @BatchProperty(name = "platform")
    private String platformName;
    
    private Platform platform;
    
    @Override
    public void open(Serializable ckpt) throws Exception {
    	platform = Platform.valueOf(platformName);
    	File f = new File(platform.getName() + "_missing_" + getCheckName() + ".txt");
    	f.delete();
    }

    @Override
    public void close() throws Exception { }

    @Override
    public void writeItems(List<Object> list) throws Exception {
    	FileWriter fwriter = new FileWriter(platform.getName() + "_missing_" + getCheckName() + ".txt");
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
