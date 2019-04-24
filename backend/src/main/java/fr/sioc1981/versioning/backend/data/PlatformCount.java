package fr.sioc1981.versioning.backend.data;

import java.util.Objects;

public class PlatformCount {
	
	private boolean deployed;
	
	private boolean validated;
	
	private boolean undeployed;
	
	private long deployedPatchCount;
	
	private long validedPatchCount;
	
	public PlatformCount(Boolean deployed, Boolean validated, Boolean undeployed, Long deployedPatchCount, Long validedPatchCount) {
		super();
		this.deployed = deployed;
		this.validated = validated;
		this.undeployed = undeployed;
		this.deployedPatchCount = deployedPatchCount;
		this.validedPatchCount = validedPatchCount;
	}

	public boolean isDeployed() {
		return deployed;
	}

	public void setDeployed(boolean deployed) {
		this.deployed = deployed;
	}

	public boolean isValidated() {
		return validated;
	}

	public void setValidated(boolean validated) {
		this.validated = validated;
	}

	public boolean isUndeployed() {
		return undeployed;
	}

	public void setUndeployed(boolean undeployed) {
		this.undeployed = undeployed;
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

	@Override
	public int hashCode() {
		return Objects.hash(deployed, deployedPatchCount, undeployed, validated, validedPatchCount);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		PlatformCount other = (PlatformCount) obj;
		return deployed == other.deployed && deployedPatchCount == other.deployedPatchCount
				&& undeployed == other.undeployed && validated == other.validated
				&& validedPatchCount == other.validedPatchCount;
	}

	@Override
	public String toString() {
		return String.format(
				"PlatformCount [deployed=%s, validated=%s, undeployed=%s, deployedPatchCount=%s, validedPatchCount=%s]",
				deployed, validated, undeployed, deployedPatchCount, validedPatchCount);
	}

	
	
}
