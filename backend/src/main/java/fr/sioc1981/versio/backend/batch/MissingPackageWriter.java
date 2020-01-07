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
import java.text.SimpleDateFormat;
import java.util.List;
import javax.batch.api.chunk.ItemWriter;
import javax.enterprise.context.Dependent;
import javax.inject.Named;

import fr.sioc1981.versio.backend.entity.Patch;

/* Writer artifact.
 * Write each bill to a text file.
 */
@Dependent
@Named("MissingPackageWriter")
public class MissingPackageWriter implements ItemWriter {
	
	private final SimpleDateFormat dformat = new SimpleDateFormat("yyyy-MM-dd");
    
    @Override
    public void open(Serializable ckpt) throws Exception { }

    @Override
    public void close() throws Exception { }

    @Override
    public void writeItems(List<Object> list) throws Exception {
    	FileWriter fwriter = new FileWriter("missing_package.txt");
    	try (BufferedWriter bwriter = new BufferedWriter(fwriter)) {
    		bwriter.write("Missing packages: ");
    		bwriter.newLine();
    		bwriter.write(" ");
    		bwriter.newLine();
    		for (Object patchObject : list) {
    			Patch patch = (Patch) patchObject;
                bwriter.write(String.format("%s - %s: Last Build on %s and package date %s", 
                		patch.getRelease().getVersion().getVersionNumber(),
                		patch.getSequenceNumber(),
                		dformat.format(patch.getBuildDate()),
                		patch.getPackageDate() != null ? dformat.format(patch.getPackageDate()) : null
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
