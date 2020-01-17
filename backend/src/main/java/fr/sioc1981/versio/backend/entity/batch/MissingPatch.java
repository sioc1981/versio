package fr.sioc1981.versio.backend.entity.batch;

import java.io.Serializable;
import java.time.Duration;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;

import fr.sioc1981.versio.backend.entity.Patch;

@Entity
public class MissingPatch implements Serializable {
	
	private static final long serialVersionUID = -3085518073196788868L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "missing_patch_sequence")
	@SequenceGenerator(name = "missing_patch_sequence", allocationSize = 1 )
	private Long id;
	
	@ManyToOne(fetch= FetchType.EAGER)
	private Patch patch;
	
	@Enumerated(EnumType.STRING)
	private Platform platform;
	
	@Enumerated(EnumType.STRING)
	private ProcessStep processStep;
	
	private Duration duration; 

	public MissingPatch() {
		super();
	}

	public MissingPatch(Patch patch, Platform platform, ProcessStep processStep, Duration duration) {
		super();
		this.patch = patch;
		this.platform = platform;
		this.processStep = processStep;
		this.duration = duration;
	}

	public Patch getPatch() {
		return patch;
	}

	public void setPatch(Patch patch) {
		this.patch = patch;
	}

	public Platform getPlatform() {
		return platform;
	}

	public void setPlatform(Platform platform) {
		this.platform = platform;
	}

	public ProcessStep getProcessStep() {
		return processStep;
	}

	public void setProcessStep(ProcessStep processStep) {
		this.processStep = processStep;
	}

	public Duration getDuration() {
		return duration;
	}

	public void setDuration(Duration duration) {
		this.duration = duration;
	}

}
