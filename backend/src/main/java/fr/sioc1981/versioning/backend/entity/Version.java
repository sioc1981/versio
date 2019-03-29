package fr.sioc1981.versioning.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import javax.persistence.*;

/**
 * Entity implementation class for Entity: Version
 *
 */
@Entity
@Table(name="version", uniqueConstraints = @UniqueConstraint(columnNames= {"versionNumber"}))
public class Version implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE)
	private Long id;

	private String versionNumber;

	public Version() {
		super();
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

	public void setVersionNumber(String number) {
		this.versionNumber = number;
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Version other = (Version) obj;
		return Objects.equals(id, other.id) && Objects.equals(versionNumber, other.versionNumber);
	}

	@Override
	public String toString() {
		return "Version [versionNumber=" + versionNumber + "]";
	}

}
