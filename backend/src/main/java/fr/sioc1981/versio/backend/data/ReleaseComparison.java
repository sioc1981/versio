package fr.sioc1981.versio.backend.data;

import java.util.List;

import fr.sioc1981.versio.backend.entity.Release;

public class ReleaseComparison {

	private List<Release> sourceReleases;

	private List<Release> destReleases;

	public ReleaseComparison() {
		super();
	}

	public List<Release> getSourceReleases() {
		return sourceReleases;
	}

	public void setSourceReleases(List<Release> sourceReleases) {
		this.sourceReleases = sourceReleases;
	}

	public List<Release> getDestReleases() {
		return destReleases;
	}

	public void setDestReleases(List<Release> destReleases) {
		this.destReleases = destReleases;
	}

}
