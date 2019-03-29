package fr.sioc1981.versioning.backend.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

import javax.persistence.*;

/**
 * Entity implementation class for Entity: Deployable
 *
 */
@MappedSuperclass
@Inheritance(strategy=InheritanceType.TABLE_PER_CLASS)
public abstract class Deployable implements Serializable {

	private static final long serialVersionUID = 1L;
	
	@Temporal(TemporalType.DATE)
	protected Date buildDate;
	@Temporal(TemporalType.DATE)
	protected Date packageDate;
	@Temporal(TemporalType.DATE)
	protected Date qualificationDate;
	@Temporal(TemporalType.DATE)
	protected Date kuQualificationDate;
	@Temporal(TemporalType.DATE)
	protected Date pilotDate;
	@Temporal(TemporalType.DATE)
	protected Date productionDate;

	public Deployable() {
		super();
	}

	public Date getBuildDate() {
		return buildDate;
	}

	public void setBuildDate(Date buildDate) {
		this.buildDate = buildDate;
	}

	public Date getPackageDate() {
		return packageDate;
	}

	public void setPackageDate(Date packageDate) {
		this.packageDate = packageDate;
	}

	public Date getQualificationDate() {
		return qualificationDate;
	}

	public void setQualificationDate(Date qualificationDate) {
		this.qualificationDate = qualificationDate;
	}

	public Date getKuQualificationDate() {
		return kuQualificationDate;
	}

	public void setKuQualificationDate(Date kuQualificationDate) {
		this.kuQualificationDate = kuQualificationDate;
	}

	public Date getPilotDate() {
		return pilotDate;
	}

	public void setPilotDate(Date pilotDate) {
		this.pilotDate = pilotDate;
	}

	public Date getProductionDate() {
		return productionDate;
	}

	public void setProductionDate(Date productionDate) {
		this.productionDate = productionDate;
	}

	@Override
	public int hashCode() {
		return Objects.hash(buildDate, kuQualificationDate, packageDate, pilotDate, productionDate, qualificationDate);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Deployable other = (Deployable) obj;
		return Objects.equals(buildDate, other.buildDate)
				&& Objects.equals(kuQualificationDate, other.kuQualificationDate)
				&& Objects.equals(packageDate, other.packageDate) && Objects.equals(pilotDate, other.pilotDate)
				&& Objects.equals(productionDate, other.productionDate)
				&& Objects.equals(qualificationDate, other.qualificationDate);
	}
	
}
