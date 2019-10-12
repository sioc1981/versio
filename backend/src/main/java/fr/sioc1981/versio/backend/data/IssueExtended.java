package fr.sioc1981.versio.backend.data;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import fr.sioc1981.versio.backend.entity.Issue;
import fr.sioc1981.versio.backend.entity.Patch;
import fr.sioc1981.versio.backend.entity.Release;

public class IssueExtended {
	
	private String issueReference;
	
	private Issue issue;

	private List<Release> releases;
	
	private List<Patch> patches;

	public String getIssueReference() {
		return issueReference;
	}

	public void setIssueReference(String issueReference) {
		this.issueReference = issueReference;
	}

	public Issue getIssue() {
		return issue;
	}

	public void setIssue(Issue issue) {
		this.issue = issue;
	}

	public List<Release> getReleases() {
		return releases;
	}

	public void setReleases(List<Release> releases) {
		this.releases = releases;
	}

	public List<Patch> getPatches() {
		return patches;
	}

	public void setPatches(List<Patch> patches) {
		this.patches = patches;
	}

	@Override
	public int hashCode() {
		return Objects.hash(issue, issueReference, patches, releases);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		IssueExtended other = (IssueExtended) obj;
		return Objects.equals(issue, other.issue) && Objects.equals(issueReference, other.issueReference)
				&& Objects.equals(patches, other.patches) && Objects.equals(releases, other.releases);
	}

	@Override
	public String toString() {
		return String.format("IssueExtended [issueReference=%s, issue=%s, releases=%s, patches=%s]", issueReference,
				issue, releases, patches);
	}
	
}
