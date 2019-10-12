package fr.sioc1981.versio.backend.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

import javax.json.bind.annotation.JsonbDateFormat;
import javax.persistence.Embeddable;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Embeddable
public class PlatformHistory implements Serializable {

	private static final long serialVersionUID = 1L;

	@Temporal(TemporalType.DATE)
	@JsonbDateFormat
	protected Date deployDate;

	@Temporal(TemporalType.DATE)
	@JsonbDateFormat
	protected Date validationDate;

	@Temporal(TemporalType.DATE)
	@JsonbDateFormat
	protected Date undeployDate;

	public Date getDeployDate() {
		return deployDate;
	}

	public void setDeployDate(Date deployDate) {
		this.deployDate = deployDate;
	}

	public Date getValidationDate() {
		return validationDate;
	}

	public void setValidationDate(Date validationDate) {
		this.validationDate = validationDate;
	}

	public Date getUndeployDate() {
		return undeployDate;
	}

	public void setUndeployDate(Date undeployDate) {
		this.undeployDate = undeployDate;
	}

	@Override
	public int hashCode() {
		return Objects.hash(deployDate, undeployDate, validationDate);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		PlatformHistory other = (PlatformHistory) obj;
		return Objects.equals(deployDate, other.deployDate) && Objects.equals(undeployDate, other.undeployDate)
				&& Objects.equals(validationDate, other.validationDate);
	}

	@Override
	public String toString() {
		return String.format("PlatformHistory [deployDate=%s, validationDate=%s, undeployDate=%s]", deployDate,
				validationDate, undeployDate);
	}

}
