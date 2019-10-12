package fr.sioc1981.versio.backend.data;
import java.util.Objects;

import fr.sioc1981.versio.backend.entity.Issue;

public class IssueReleaseComparisonResultItem {
	
	private String issueReference;
	
	private Issue issue;
	
	private String releaseVersion;
	
	private String patchSequence;
	
	public IssueReleaseComparisonResultItem() {
		super();
	}

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

	public String getReleaseVersion() {
		return releaseVersion;
	}

	public void setReleaseVersion(String releaseVersion) {
		this.releaseVersion = releaseVersion;
	}

	public String getPatchSequence() {
		return patchSequence;
	}

	public void setPatchSequence(String patchSequence) {
		this.patchSequence = patchSequence;
	}

	@Override
	public int hashCode() {
		return Objects.hash(issue, issueReference, patchSequence, releaseVersion);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		IssueReleaseComparisonResultItem other = (IssueReleaseComparisonResultItem) obj;
		return Objects.equals(issue, other.issue) && Objects.equals(issueReference, other.issueReference)
				&& Objects.equals(patchSequence, other.patchSequence)
				&& Objects.equals(releaseVersion, other.releaseVersion);
	}

	@Override
	public String toString() {
		return String.format(
				"IssueReleaseComparisonResultItem [issueReference=%s, issue=%s, releaseVersion=%s, patchSequence=%s]",
				issueReference, issue, releaseVersion, patchSequence);
	}
	
}
