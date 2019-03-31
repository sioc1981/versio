package fr.sioc1981.versioning.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import javax.persistence.*;

/**
 * Entity implementation class for Entity: Version
 *
 */
@Entity
@Table(name = "version", uniqueConstraints = @UniqueConstraint(columnNames = { "versionNumber" }))
public class Version implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;

	private String versionNumber;

	private int baseNumber;

	private int interimNumber;

	private int featureNumber;

	private int patchNumber;

	public Version() {
		super();
	}

	public Version(String versionNumber) {
		super();
		this.versionNumber = versionNumber;
		this.generatePart();
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

	public int getBaseNumber() {
		return baseNumber;
	}

	public void setBaseNumber(int baseNumber) {
		this.baseNumber = baseNumber;
	}

	public int getInterimNumber() {
		return interimNumber;
	}

	public void setInterimNumber(int interimNumber) {
		this.interimNumber = interimNumber;
	}

	public int getFeatureNumber() {
		return featureNumber;
	}

	public void setFeatureNumber(int featureNumber) {
		this.featureNumber = featureNumber;
	}

	public int getPatchNumber() {
		return patchNumber;
	}

	public void setPatchNumber(int patchNumber) {
		this.patchNumber = patchNumber;
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@PrePersist
	@PreUpdate
	public void generatePart() {
		Runtime.Version v = Runtime.Version.parse(versionNumber);
		this.baseNumber = v.feature();
		this.interimNumber = v.interim();
		this.featureNumber = v.update();
		this.patchNumber = v.patch();
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
		return String.format(
				"Version [versionNumber=%s, baseNumber=%s, interimNumber=%s, featureNumber=%s, patchNumber=%s]",
				versionNumber, baseNumber, interimNumber, featureNumber, patchNumber);
	}

}
