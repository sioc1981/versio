package fr.sioc1981.versioning.backend.data;

public class ReleaseFullSummary {

	private Long id;

	private String versionNumber;

	private boolean undeployed;
	
	private int patchCount;
	private int packagedPatches;
	
	private PlatformCount qualification;
	private PlatformCount keyUser;
	private PlatformCount pilot;
	private PlatformCount production;
	
	
	public ReleaseFullSummary() {
		super();
	}

	public ReleaseFullSummary(Long id, String versionNumber, Boolean undeployed, Integer patchCount, Integer packagedPatches) {
		super();
		this.id = id;
		this.versionNumber = versionNumber;
		this.undeployed = undeployed != null && undeployed;
		this.patchCount = patchCount;
		this.packagedPatches = packagedPatches;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getVersionNumber() {
		return versionNumber;
	}

	public void setVersionNumber(String versionNumber) {
		this.versionNumber = versionNumber;
	}

	public boolean isUndeployed() {
		return undeployed;
	}

	public void setUndeployed(boolean undeployed) {
		this.undeployed = undeployed;
	}

	public int getPatchCount() {
		return patchCount;
	}

	public void setPatchCount(int patchCount) {
		this.patchCount = patchCount;
	}

	public int getPackagedPatches() {
		return packagedPatches;
	}

	public void setPackagedPatches(int packagedPatches) {
		this.packagedPatches = packagedPatches;
	}

	public PlatformCount getQualification() {
		return qualification;
	}

	public void setQualification(PlatformCount qualification) {
		this.qualification = qualification;
	}

	public PlatformCount getKeyUser() {
		return keyUser;
	}

	public void setKeyUser(PlatformCount keyUser) {
		this.keyUser = keyUser;
	}

	public PlatformCount getPilot() {
		return pilot;
	}

	public void setPilot(PlatformCount pilot) {
		this.pilot = pilot;
	}

	public PlatformCount getProduction() {
		return production;
	}

	public void setProduction(PlatformCount production) {
		this.production = production;
	}

	@Override
	public String toString() {
		return String.format(
				"ReleaseFullSummary [id=%s, versionNumber=%s, undeployed=%s, patchCount=%s, packagedPatches=%s, qualification=%s, keyUser=%s, pilot=%s, production=%s]",
				id, versionNumber, undeployed, patchCount, packagedPatches, qualification, keyUser, pilot, production);
	}

}
