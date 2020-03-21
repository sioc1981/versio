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

import javax.batch.api.BatchProperty;
import javax.batch.api.chunk.ItemReader;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import fr.sioc1981.versio.backend.batch.data.ItemNumberCheckpoint;
import fr.sioc1981.versio.backend.entity.Patch;
import fr.sioc1981.versio.backend.entity.batch.Platform;

/* Reader batch artifact.
 * Reads bills from the entity manager.
 * This artifact is in a partitioned step.
 */
public abstract class AbstractMissingReader implements ItemReader {

    private ItemNumberCheckpoint checkpoint;

    @PersistenceContext
    private EntityManager em;
    private Iterator<Patch> iterator;
    
    @Inject
    @BatchProperty(name = "platform")
    private String platformName;

	protected Platform platform;

    public AbstractMissingReader() {
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
        final long firstItem = checkpoint.getItemNumber();
        platform = Platform.valueOf(platformName);
        
        final String checkColumn = getCheckColumn();
        final String referenceColumn = getReferenceColumn();
        final String nextStepColumn = getNextStepColumn();
        String nextStepQuery = "";
        if (nextStepColumn != null) {
        	nextStepQuery = " AND (" + nextStepColumn + " is null OR " + checkColumn + " > " + nextStepColumn + ")";
        }
        
        String query = "SELECT p FROM Patch p where " + referenceColumn + " is not null and (" + checkColumn + " is null"
        		+ " or " + checkColumn + " < " + referenceColumn + ")" + nextStepQuery + " ORDER BY p.release.version.versionNumber, p.sequenceNumber";
        TypedQuery<Patch> q = em.createQuery(query, Patch.class).setFirstResult((int) firstItem);
        iterator = q.getResultList().iterator();
    }

	protected abstract String getCheckColumn() ;
	
	protected abstract String getReferenceColumn() ;
	
	protected abstract String getNextStepColumn() ;

	@Override
    public void close() throws Exception {
    }

    @Override
    public Object readItem() throws Exception {
        if (iterator.hasNext()) {
            checkpoint.nextItem();
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
