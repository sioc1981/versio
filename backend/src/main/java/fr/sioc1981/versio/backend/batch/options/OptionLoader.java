package fr.sioc1981.versio.backend.batch.options;

import java.util.List;

import javax.batch.runtime.BatchRuntime;
import javax.batch.runtime.JobExecution;
import javax.batch.runtime.context.JobContext;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.entity.batch.BatchOption;

@Dependent
public class OptionLoader {
	
	private final Logger log = LoggerFactory.getLogger(this.getClass());

    @PersistenceContext
    private EntityManager em;
    
	@Inject
    JobContext jobCtx;
    
	public String loadOption(String key) throws Exception {
    	String result = null;
		JobExecution jobExecution = BatchRuntime.getJobOperator().getJobExecution(jobCtx.getExecutionId());
		result = jobExecution.getJobParameters().getProperty(key);
		if(result != null) {
			log.info("load option {} from JobParameters: {}", key, result);
			return result;
		}
		TypedQuery<BatchOption> query = em.createQuery("select bo from BatchOption bo where bo.key = :key", BatchOption.class);
		query.setParameter("key", key);
		List<BatchOption> dbResult = query.getResultList();
		if (!dbResult.isEmpty()) {
			result = dbResult.get(0).getValue();
			log.info("load option {} from BatchOption: {}", key, result);
			return result;
		}
    	
		result =  jobCtx.getProperties().getProperty(key);
		log.info("load option {} from JobProperties: {}", key, result);
		return result;
	}

	public boolean containsOption(String key) {
		String result = null;
		JobExecution jobExecution = BatchRuntime.getJobOperator().getJobExecution(jobCtx.getExecutionId());
		result = jobExecution.getJobParameters().getProperty(key);
		if(result != null) {
			return true;
		}
		TypedQuery<BatchOption> query = em.createQuery("select bo from BatchOption bo where bo.key = :key", BatchOption.class);
		query.setParameter("key", key);
		List<BatchOption> dbResult = query.getResultList();
		if (!dbResult.isEmpty()) {
			result = dbResult.get(0).getValue();
			return true;
		}
    	
		result =  jobCtx.getProperties().getProperty(key);
		return result != null;
	}
}
