package fr.sioc1981.versio.backend.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

import javax.persistence.*;

/**
 * Entity implementation class for Entity: Deployable
 *
 */
@MappedSuperclass
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Deployable implements Serializable {

	private static final long serialVersionUID = 1L;

	@Temporal(TemporalType.DATE)
	protected Date buildDate;
	@Temporal(TemporalType.DATE)
	protected Date packageDate;
	
	protected boolean undeployed;
	
	@Column(name="commentContent", length = 512)
	protected String comment;

	@Embedded
	// rename the basic mappings
	@AttributeOverride(name = "deployDate", column = @Column(name = "QUALIFICATION_DEPLOY_DATE"))
	@AttributeOverride(name = "validationDate", column = @Column(name = "QUALIFICATION_VALIDATION_DATE"))
	@AttributeOverride(name = "undeployDate", column = @Column(name = "QUALIFICATION_UNDEPLOY_DATE"))
	protected PlatformHistory qualification;

	@Embedded
	// rename the basic mappings
	@AttributeOverride(name = "deployDate", column = @Column(name = "KEYUSER_DEPLOY_DATE"))
	@AttributeOverride(name = "validationDate", column = @Column(name = "KEYUSER_VALIDATION_DATE"))
	@AttributeOverride(name = "undeployDate", column = @Column(name = "KEYUSER_UNDEPLOY_DATE"))
	protected PlatformHistory keyUser;

	@Embedded
	// rename the basic mappings
	@AttributeOverride(name = "deployDate", column = @Column(name = "PILOT_DEPLOY_DATE"))
	@AttributeOverride(name = "validationDate", column = @Column(name = "PILOT_VALIDATION_DATE"))
	@AttributeOverride(name = "undeployDate", column = @Column(name = "PILOT_UNDEPLOY_DATE"))
	protected PlatformHistory pilot;

	@Embedded
	// rename the basic mappings
	@AttributeOverride(name = "deployDate", column = @Column(name = "PRODUCTION_DEPLOY_DATE"))
	@AttributeOverride(name = "validationDate", column = @Column(name = "PRODUCTION_VALIDATION_DATE"))
	@AttributeOverride(name = "undeployDate", column = @Column(name = "PRODUCTION_UNDEPLOY_DATE"))
	protected PlatformHistory production;

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

	public boolean getUndeployed() {
		return undeployed;
	}

	public void setUndeployed(boolean undeployed) {
		this.undeployed = undeployed;
	}

	public PlatformHistory getQualification() {
		return qualification;
	}

	public void setQualification(PlatformHistory qualification) {
		this.qualification = qualification;
	}

	public PlatformHistory getKeyUser() {
		return keyUser;
	}

	public void setKeyUser(PlatformHistory keyUser) {
		this.keyUser = keyUser;
	}

	public PlatformHistory getPilot() {
		return pilot;
	}

	public void setPilot(PlatformHistory pilot) {
		this.pilot = pilot;
	}

	public PlatformHistory getProduction() {
		return production;
	}

	public void setProduction(PlatformHistory production) {
		this.production = production;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	@Override
	public int hashCode() {
		return Objects.hash(buildDate, keyUser, packageDate, pilot, production, qualification, undeployed, comment);
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
		return Objects.equals(buildDate, other.buildDate) && Objects.equals(keyUser, other.keyUser)
				&& Objects.equals(packageDate, other.packageDate) && Objects.equals(pilot, other.pilot)
				&& Objects.equals(production, other.production) && Objects.equals(qualification, other.qualification)
				&& undeployed == other.undeployed && Objects.equals(comment, other.comment);
	}

	@Override
	public String toString() {
		return String.format(
				"Deployable [buildDate=%s, packageDate=%s, undeployed=%s, qualification=%s, keyUser=%s, pilot=%s, production=%s, comment=%s]",
				buildDate, packageDate, undeployed, qualification, keyUser, pilot, production, comment);
	}

}
