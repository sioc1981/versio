/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.notify.email;

import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;

import javax.batch.api.chunk.ItemReader;
import javax.batch.runtime.context.JobContext;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;

import fr.sioc1981.versio.backend.batch.data.ItemNumberCheckpoint;
import fr.sioc1981.versio.backend.batch.options.OptionLoader;

/* Reader batch artifact.
 * Reads bills from the entity manager.
 * This artifact is in a partitioned step.
 */
@Dependent
@Named("EmailNotifierReader")
public class EmailNotifierReader implements ItemReader {

    private ItemNumberCheckpoint checkpoint;

    @Inject
    OptionLoader optionLoader;

    private Iterator<Path> iterator;

    public EmailNotifierReader() {
    }

    @Override
    public void open(Serializable ckpt) throws Exception {

        if (ckpt == null) {
            /* Create a checkpoint object */
            checkpoint = new ItemNumberCheckpoint();
        } else {
            checkpoint = (ItemNumberCheckpoint) ckpt;
        }

        /* Adjust range for this partition from the checkpoint */
        long firstItem = checkpoint.getItemNumber();

    	String dirPath = optionLoader.loadOption("outputDir");
    	Path dir = Paths.get(dirPath);
    	iterator = Files.newDirectoryStream(dir).iterator();
    	for (int i = 0; i < firstItem; i++) {
    		iterator.next();
		}
    }

    @Override
    public void close() throws Exception {
    }

    @Override
    public Object readItem() throws Exception {
        if (iterator.hasNext()) {
            checkpoint.nextItem();
            return Files.readString(iterator.next());
        } else {
            return null;
        }
    }

    @Override
    public Serializable checkpointInfo() throws Exception {
        return checkpoint;
    }

}
