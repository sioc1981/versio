package fr.sioc1981.versio.backend.entity;

import java.io.Serializable;
import java.lang.String;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: Application
 *
 */
@Entity
public class Application implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	private int id;
	private String name;
	private boolean includeAllReleasesWhenComparing = false;

	public Application() {
		super();
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isIncludeAllReleasesWhenComparing() {
		return includeAllReleasesWhenComparing;
	}

	public void setIncludeAllReleasesWhenComparing(boolean includeAllReleasesWhenComparing) {
		this.includeAllReleasesWhenComparing = includeAllReleasesWhenComparing;
	}

}
