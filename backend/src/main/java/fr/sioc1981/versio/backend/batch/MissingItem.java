package fr.sioc1981.versio.backend.batch;

import java.io.Serializable;
import java.time.Duration;

import fr.sioc1981.versio.backend.entity.Patch;

public class MissingItem implements Serializable {
	
	private static final long serialVersionUID = -3085518073196788868L;

	private Patch patch;
	
	private Platform platform;
	
	private Duration duration; 

	public MissingItem() {
		super();
	}

	public MissingItem(Patch patch, Platform platform, Duration duration) {
		super();
		this.patch = patch;
		this.platform = platform;
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

	public Duration getDuration() {
		return duration;
	}

	public void setDuration(Duration duration) {
		this.duration = duration;
	}

}
