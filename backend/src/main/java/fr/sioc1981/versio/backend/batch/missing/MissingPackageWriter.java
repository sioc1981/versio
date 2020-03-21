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
import java.util.List;
import java.util.stream.Collectors;

import javax.batch.api.chunk.ItemWriter;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.batch.data.ItemNumberCheckpoint;
import fr.sioc1981.versio.backend.batch.options.OptionLoader;
import fr.sioc1981.versio.backend.entity.Patch;
import fr.sioc1981.versio.backend.entity.batch.MissingPatch;
import fr.sioc1981.versio.backend.entity.batch.ProcessStep;
import fr.sioc1981.versio.backend.util.DurationConverter;

/* Writer artifact.
 * Write each bill to a text file.
 */
@Dependent
@Named("MissingPackageWriter")
public class MissingPackageWriter implements ItemWriter {

	private final Logger log = LoggerFactory.getLogger(this.getClass());

	@PersistenceContext
	private EntityManager em;

	@Inject
	private OptionLoader optionLoader;

	private File file;
	private BufferedWriter bwriter;

	@Override
	public void open(Serializable ckpt) throws Exception {
		String dirPath = optionLoader.loadOption("outputDir");
		File dir = new File(dirPath);
		dir.mkdirs();
		file = new File(dir, "missing_package.txt");
		file.delete();
		FileWriter fwriter = new FileWriter(file);
		bwriter = new BufferedWriter(fwriter);
		bwriter.write("Missing packages: ");
		bwriter.newLine();
		Query query = em.createQuery("DELETE FROM MissingPatch where platform is null and processStep = :processStep");
		query.setParameter("processStep", ProcessStep.PACKAGE);
		query.executeUpdate();
	}

	@Override
	public void close() throws Exception {
		bwriter.write(" ");
		bwriter.newLine();
	}

	@Override
	public void writeItems(List<Object> list) throws Exception {
		log.info("Detect {} missing packaged patches", list.size());
		for (Object missingItemObject : list) {
			MissingPatch missingItem = (MissingPatch) missingItemObject;
			em.merge(missingItem);
			Patch patch = missingItem.getPatch();
			bwriter.write(String.format("%s - %s %s: since %s", patch.getRelease().getVersion().getVersionNumber(),
					patch.getSequenceNumber(),
					patch.getIssues().stream().map(i -> i.getReference()).collect(Collectors.joining(", ", "[", "]")),
					DurationConverter.convertDuration(missingItem.getDuration())));
			bwriter.newLine();
		}

	}

	@Override
	public Serializable checkpointInfo() throws Exception {
		return new ItemNumberCheckpoint();
	}

}
