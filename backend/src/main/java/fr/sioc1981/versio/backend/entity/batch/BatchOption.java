package fr.sioc1981.versio.backend.entity.batch;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

/**
 * Entity implementation class for Entity: BatchOption
 *
 */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "option_key" }))
public class BatchOption {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "batch_option_sequence")
	@SequenceGenerator(name = "batch_option_sequence", allocationSize = 1 )
	private Long id;

	@Column(name = "option_key")
	private String key;

	@Column(name = "option_value")
	private String value;

	public BatchOption() {
		super();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	@Override
	public String toString() {
		return String.format("BatchOption [id=%s, key=%s, value=%s]", id, key, value);
	}
	
}
