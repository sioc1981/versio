package fr.sioc1981.versio.backend.batch.schudeler;

import java.util.Properties;

import javax.batch.operations.JobOperator;
import javax.batch.runtime.BatchRuntime;
import javax.ejb.LocalBean;
import javax.ejb.Schedule;
import javax.ejb.Stateless;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Stateless
@LocalBean
public class BatchScheduler {

	private static final Logger LOG = LoggerFactory.getLogger(BatchScheduler.class);
	
	@Schedule(hour = "6")
	public void traiterMinutes() {
		JobOperator jobOperator = BatchRuntime.getJobOperator();
		long execID = jobOperator.start("missingall", new Properties());
		LOG.info("Starting missingAll job ({})", execID);
	}

}