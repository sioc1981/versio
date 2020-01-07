/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.Serializable;
import java.util.List;

import javax.batch.api.BatchProperty;
import javax.batch.api.chunk.ItemWriter;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;

import fr.sioc1981.versio.backend.entity.Patch;

/* Writer artifact.
 * Write each bill to a text file.
 */
@Dependent
@Named("MissingDeploymentWriter")
public class MissingDeploymentWriter implements ItemWriter {
	
    @Inject
    @BatchProperty(name = "platform")
    private String platformName;
    
    @Override
    public void open(Serializable ckpt) throws Exception { }

    @Override
    public void close() throws Exception { }

    @Override
    public void writeItems(List<Object> list) throws Exception {
    	FileWriter fwriter = new FileWriter(platformName + "_missing_deployment.txt");
    	try (BufferedWriter bwriter = new BufferedWriter(fwriter)) {
    		bwriter.write("Missing deployement: ");
    		bwriter.newLine();
    		bwriter.write(" ");
    		bwriter.newLine();
    		for (Object patchObject : list) {
    			Patch patch = (Patch) patchObject;
                bwriter.write(String.format("%s - %s: on %s", 
                		patch.getRelease().getVersion().getVersionNumber(),
                		patch.getSequenceNumber(),
                		platformName
                		));
                bwriter.newLine();
            }
        }
    }

    @Override
    public Serializable checkpointInfo() throws Exception {
        return new ItemNumberCheckpoint();
    }
    
}
