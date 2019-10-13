package fr.sioc1981.versio.backend.entity;

import java.util.Objects;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Entity implementation class for Entity: Release
 *
 */
@Entity
@JsonIgnoreProperties(ignoreUnknown=true)
public class Release extends Deployable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue
	protected Long id;

	@OneToOne(fetch = FetchType.EAGER, cascade=CascadeType.ALL, orphanRemoval=true)
	protected Version version;
	
	@ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH})
	private Set<ApplicationUser> applicationUsers;

	public Release() {
		super();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}


	public Version getVersion() {
		return version;
	}

	public void setVersion(Version version) {
		this.version = version;
	}
	
	public Set<ApplicationUser> getApplicationUsers() {
		return applicationUsers;
	}

	public void setApplicationUsers(Set<ApplicationUser> applicationUsers) {
		this.applicationUsers = applicationUsers;
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
		return Objects.equals(id, other.id) && Objects.equals(version, other.version)
				&& Objects.equals(applicationUsers, other.applicationUsers);
	}

	@Override
	public String toString() {
		return String.format(
				"Release [id=%s, version=%s, buildDate=%s, packageDate=%s, qualification=%s, keyUser=%s, pilot=%s, production=%s]",
				id, version, buildDate, packageDate, qualification, keyUser, pilot, production);
	}

}
