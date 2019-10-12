package fr.sioc1981.versio.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import javax.persistence.Entity;
import javax.persistence.Id;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import fr.sioc1981.versio.backend.data.IssueContainer;

/**
 * Entity implementation class for Entity: Issue
 *
 */
@Entity
@JsonIgnoreProperties(ignoreUnknown=true)
public class Issue implements Serializable {

	@Id
	private String reference;
	private String description;
	private String globalReference;
	private IssueContainer container;
	private static final long serialVersionUID = 1L;

	public Issue() {
		super();
	}   
	public String getReference() {
		return this.reference;
	}

	public void setReference(String reference) {
		this.reference = reference;
	}   
	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}   
	public String getGlobalReference() {
		return this.globalReference;
	}

	public void setGlobalReference(String globalReference) {
		this.globalReference = globalReference;
	}
	
	public IssueContainer getContainer() {
		return container;
	}
	public void setContainer(IssueContainer url) {
		this.container = url;
	}
	@Override
	public int hashCode() {
		return Objects.hash(reference);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Issue other = (Issue) obj;
		return Objects.equals(description, other.description) && Objects.equals(globalReference, other.globalReference)
			&& Objects.equals(reference, other.reference) && Objects.equals(container, other.container);
	}
	
	@Override
	public String toString() {
		return String.format("Issue [reference=%s, description=%s, globalReference=%s, container=%s]", reference,
				description, globalReference, container);
	}
	
	
   
}
