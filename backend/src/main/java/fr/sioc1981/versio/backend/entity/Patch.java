package fr.sioc1981.versio.backend.entity;

import java.util.List;
import java.util.Objects;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Entity implementation class for Entity: Patch
 *
 */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "release_id", "sequenceNumber" }))
@JsonIgnoreProperties(ignoreUnknown=true)
public class Patch extends Deployable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue
	private Long id;

	@ManyToMany(fetch = FetchType.EAGER)
	private List<Issue> issues;

	@ManyToOne(fetch= FetchType.EAGER)
	private Release release;

	private String sequenceNumber;

	public Patch() {
		super();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public List<Issue> getIssues() {
		return issues;
	}

	public void setIssues(List<Issue> issues) {
		this.issues = issues;
	}

	public Release getRelease() {
		return release;
	}

	public void setRelease(Release release) {
		this.release = release;
	}

	public String getSequenceNumber() {
		return sequenceNumber;
	}

	public void setSequenceNumber(String sequence) {
		this.sequenceNumber = sequence;
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		Patch other = (Patch) obj;
		return Objects.equals(id, other.id) && Objects.equals(issues, other.issues)
				&& Objects.equals(release, other.release) && Objects.equals(sequenceNumber, other.sequenceNumber);
	}

	@Override
	public String toString() {
		return String.format(
				"Patch [id=%s, issues=%s, release=%s, sequenceNumber=%s, buildDate=%s, packageDate=%s, qualification=%s, keyUser=%s, pilot=%s, production=%s]",
				id, issues, release, sequenceNumber, buildDate, packageDate, qualification, keyUser, pilot, production);
	}


}
