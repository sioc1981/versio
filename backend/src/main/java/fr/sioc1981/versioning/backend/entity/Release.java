package fr.sioc1981.versioning.backend.entity;

import java.util.Objects;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Entity implementation class for Entity: Patch
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
		return Objects.equals(id, other.id) && Objects.equals(version, other.version);
	}

	@Override
	public String toString() {
		return String.format(
				"Release [id=%s, version=%s, buildDate=%s, packageDate=%s, qualification=%s, keyUser=%s, pilot=%s, production=%s]",
				id, version, buildDate, packageDate, qualification, keyUser, pilot, production);
	}

}
