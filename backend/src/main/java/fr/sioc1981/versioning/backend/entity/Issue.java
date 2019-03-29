package fr.sioc1981.versioning.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * Entity implementation class for Entity: Issue
 *
 */
@Entity
public class Issue implements Serializable {

	@Id
	private String reference;
	private String description;
	private String globalReference;
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
			&& Objects.equals(reference, other.reference);
	}
	
	@Override
	public String toString() {
		return String.format("Issue [reference=%s, description=%s, globalReference=%s]", reference,
				description, globalReference);
	}
	
	
   
}
