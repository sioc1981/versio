package fr.sioc1981.versio.backend.entity.batch;

public enum ProcessStep {
	DEPLOYMENT("deployment"),
	PACKAGE("package"),
	VALIDATION("validation");
	
	private final String name;
	
	private ProcessStep(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
}
