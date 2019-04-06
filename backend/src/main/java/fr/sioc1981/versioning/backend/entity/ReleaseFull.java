package fr.sioc1981.versioning.backend.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.MapsId;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

/**
 * Entity implementation class for Entity: Patch
 *
 */
@Entity
public class ReleaseFull implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	private Long id;
	
	@OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	@JoinColumn(name = "id")
	@MapsId
	private Release release;

	
	@ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	private Set<Issue> issues;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	@JoinColumn(name = "release_id")
	private Set<Patch> patches;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Release getRelease() {
		return release;
	}

	public void setRelease(Release release) {
		this.release = release;
	}

//	public ReleaseFullPK getRelease() {
//		return release;
//	}
//	
//	public void setRelease(ReleaseFullPK release) {
//		this.release = release;
//	}
	
	public Set<Issue> getIssues() {
		return issues;
	}


	public void setIssues(Set<Issue> issues) {
		this.issues = issues;
	}

	public Set<Patch> getPatches() {
		return patches;
	}

	public void setPatches(Set<Patch> patches) {
		this.patches = patches;
	}

	@Override
	public int hashCode() {
		return Objects.hash(release);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ReleaseFull other = (ReleaseFull) obj;
		return 
//				Objects.equals(id, other.id) && 
				Objects.equals(issues, other.issues) && 
				Objects.equals(patches, other.patches)
				&& Objects.equals(release, other.release);
	}

	@Override
	public String toString() {
		return String.format("ReleaseFull [release=%s, issues=%s, patches=%s]", release, issues, patches);
	}

}
