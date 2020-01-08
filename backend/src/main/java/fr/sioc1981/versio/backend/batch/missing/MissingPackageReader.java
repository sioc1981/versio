/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.missing;

import java.io.Serializable;
import java.util.Iterator;
import javax.batch.api.chunk.ItemReader;
import javax.enterprise.context.Dependent;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import fr.sioc1981.versio.backend.entity.Patch;

/* Reader batch artifact.
 * Reads bills from the entity manager.
 * This artifact is in a partitioned step.
 */
@Dependent
@Named("MissingPackageReader")
public class MissingPackageReader implements ItemReader {

    private ItemNumberCheckpoint checkpoint;

    @PersistenceContext
    private EntityManager em;
    private Iterator<Patch> iterator;

    public MissingPackageReader() {
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

        /* Obtain an iterator for the bills in this partition */
        String query = "SELECT p FROM Patch p where p.packageDate is null or p.packageDate < p.buildDate ORDER BY p.release.version.versionNumber, p.sequenceNumber";
        TypedQuery<Patch> q = em.createQuery(query, Patch.class).setFirstResult((int) firstItem);
        iterator = q.getResultList().iterator();
    }

    @Override
    public void close() throws Exception {
    }

    @Override
    public Object readItem() throws Exception {
        if (iterator.hasNext()) {
            checkpoint.nextItem();
            checkpoint.setNumItems(checkpoint.getNumItems() - 1);
            return iterator.next();
        } else {
            return null;
        }
    }

    @Override
    public Serializable checkpointInfo() throws Exception {
        return checkpoint;
    }

}
