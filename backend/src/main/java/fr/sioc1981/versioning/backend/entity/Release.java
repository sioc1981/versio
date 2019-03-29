package fr.sioc1981.versioning.backend.entity;

import java.util.List;
import java.util.Objects;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToMany;

/**
 * Entity implementation class for Entity: Patch
 *
 */
@Entity
public class Release extends Deployable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue
	private Long id;
	
	@ManyToMany(fetch=FetchType.EAGER)
	private List<Issue> issues;
	
	private Version version;
	
	public Release() {
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

	public Version getVersion() {
		return version;
	}

	public void setVersion(Version version) {
		this.version = version;
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
		Release other = (Release) obj;
		return Objects.equals(id, other.id) && Objects.equals(issues, other.issues)
				&& Objects.equals(version, other.version);
	}

	@Override
	public String toString() {
		return String.format(
				"Release [id=%s, version=%s, issues=%s, buildDate=%s, packageDate=%s, qualificationDate=%s, kuQualificationDate=%s, pilotDate=%s, productionDate=%s]",
				id, version, issues, buildDate, packageDate, qualificationDate, kuQualificationDate, pilotDate,
				productionDate);
	}
   
	
}
