package fr.sioc1981.versio.backend.entity;

import java.io.Serializable;
import java.lang.String;
import java.util.Date;
import java.util.Objects;

import javax.json.bind.annotation.JsonbDateFormat;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// TODO: Auto-generated Javadoc
/**
 * Entity implementation class for Entity: ApplicationUser.
 */
@Entity
@JsonIgnoreProperties(ignoreUnknown=true)
public class ApplicationUser implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue
	protected Long id;
	
	/** The name. */
	@Column(unique=true, nullable=false)
	private String name;
	
	/** The country. */
	@Column(unique=true, nullable=false)
	private String country;
	
	/** The logo. */
	@Lob @Basic(fetch=FetchType.LAZY)
	@Column(name="logo", nullable=false)
	private String logo;
	
	/** The logo media type. */
	@Column(name="logo_media_type", nullable=false)
	private String logoMediaType;
	
	/** The logo update date. */
	@Temporal(TemporalType.DATE)
	@JsonbDateFormat
	protected Date logoUpdateDate;

	/**
	 * Instantiates a new application user.
	 */
	public ApplicationUser() {
		super();
	}

	/**
	 * Gets the id.
	 *
	 * @return the id
	 */
	public Long getId() {
		return this.id;
	}

	/**
	 * Sets the id.
	 *
	 * @param id the new id
	 */
	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * Gets the name.
	 *
	 * @return the name
	 */
	public String getName() {
		return this.name;
	}

	/**
	 * Sets the name.
	 *
	 * @param name the new name
	 */
	public void setName(String name) {
		this.name = name;
	}
	
	/**
	 * Gets the country.
	 *
	 * @return the country
	 */
	public String getCountry() {
		return country;
	}

	/**
	 * Sets the country.
	 *
	 * @param country the new country
	 */
	public void setCountry(String country) {
		this.country = country;
	}

	/**
	 * Gets the logo.
	 *
	 * @return the logo
	 */
	public String getLogo() {
		return logo;
	}

	/**
	 * Sets the logo.
	 *
	 * @param logo the new logo
	 */
	public void setLogo(String logo) {
		this.logo = logo;
	}

	/**
	 * Gets the logo media type.
	 *
	 * @return the logo media type
	 */
	public String getLogoMediaType() {
		return logoMediaType;
	}

	/**
	 * Sets the logo media type.
	 *
	 * @param logoMediaType the new logo media type
	 */
	public void setLogoMediaType(String logoMediaType) {
		this.logoMediaType = logoMediaType;
	}

	/**
	 * Gets the logo update date.
	 *
	 * @return the logo update date
	 */
	public Date getLogoUpdateDate() {
		return logoUpdateDate;
	}

	/**
	 * Sets the logo update date.
	 *
	 * @param logoUpdateDate the new logo update date
	 */
	public void setLogoUpdateDate(Date logoUpdateDate) {
		this.logoUpdateDate = logoUpdateDate;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		return Objects.hash(id, country, logoUpdateDate, name);
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ApplicationUser other = (ApplicationUser) obj;
		return id == other.id && Objects.equals(country, other.country)
				&& Objects.equals(logoUpdateDate, other.logoUpdateDate) && Objects.equals(name, other.name);
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return String.format("ApplicationUser [id=%s, name=%s, country=%s, logoMediaType=%s, logoUpdateDate=%s]", id, name, country,
				logoMediaType, logoUpdateDate);
	}

}
