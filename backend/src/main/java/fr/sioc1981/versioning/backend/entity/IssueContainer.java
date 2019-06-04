package fr.sioc1981.versioning.backend.entity;

import java.io.Serializable;
import java.lang.String;
import java.util.Objects;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Entity implementation class for Entity: IssueContainer.
 */
@Entity
@JsonIgnoreProperties(ignoreUnknown=true)
public class IssueContainer implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -5657189544052685067L;

	/** The id. */
	@Id
	private String id;
	
	/** The name. */
	private String name;
	
	/** The url. */
	private String url;

	/**
	 * Instantiates a new issue container.
	 */
	public IssueContainer() {
		super();
	}

	/**
	 * Gets the id.
	 *
	 * @return the id
	 */
	public String getId() {
		return id;
	}

	/**
	 * Sets the id.
	 *
	 * @param id the new id
	 */
	public void setId(String id) {
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
	 * Gets the url.
	 *
	 * @return the url
	 */
	public String getUrl() {
		return this.url;
	}

	/**
	 * Sets the url.
	 *
	 * @param url the new url
	 */
	public void setUrl(String url) {
		this.url = url;
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
		IssueContainer other = (IssueContainer) obj;
		return Objects.equals(id, other.id) && Objects.equals(name, other.name) && Objects.equals(url, other.url);
	}

	@Override
	public String toString() {
		return String.format("IssueContainer [id=%s, name=%s, url=%s]", id, name, url);
	}

}
