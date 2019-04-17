package fr.sioc1981.versioning.backend.entity;

public class ReleaseFullSummary {

	private Long id;

	private String versionNumber;

	private int patchCount;
	private int packagedPatches;

	private PlatformCount qualification;
	private PlatformCount keyUser;
	private PlatformCount pilot;
	private PlatformCount production;
	
	
	public ReleaseFullSummary() {
		super();
	}

	public ReleaseFullSummary(Long id, String versionNumber, int patchCount, int packagedPatches) {
		super();
		this.id = id;
		this.versionNumber = versionNumber;
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

}
