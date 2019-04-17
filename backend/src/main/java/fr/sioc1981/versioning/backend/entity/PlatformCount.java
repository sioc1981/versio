package fr.sioc1981.versioning.backend.entity;

public class PlatformCount {
	
	private boolean deployeded;
	
	private boolean validated;
	
	private long deployedPatchCount;
	
	private long validedPatchCount;
	
	public PlatformCount(Boolean deployed, Boolean validated, Long deployedPatchCount, Long validedPatchCount) {
		super();
		this.deployeded = deployed;
		this.validated = validated;
		this.deployedPatchCount = deployedPatchCount;
		this.validedPatchCount = validedPatchCount;
	}

	public boolean isDeployed() {
		return deployeded;
	}

	public void setDeployed(boolean deployed) {
		this.deployeded = deployed;
	}

	public boolean isValidated() {
		return validated;
	}

	public void setValidated(boolean validated) {
		this.validated = validated;
	}

	public long getDeployedPatchCount() {
		return deployedPatchCount;
	}

	public void setDeployedPatchCount(long deployedPatchCount) {
		this.deployedPatchCount = deployedPatchCount;
	}

	public long getValidedPatchCount() {
		return validedPatchCount;
	}

	public void setValidedPatchCount(long validedPatchCount) {
		this.validedPatchCount = validedPatchCount;
	}
	

}
