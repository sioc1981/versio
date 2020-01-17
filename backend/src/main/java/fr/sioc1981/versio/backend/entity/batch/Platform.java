package fr.sioc1981.versio.backend.entity.batch;

public enum Platform {
	QUALIFICATION("qualification"),
	KEY_USER("keyUser"),
	PILOT("pilot"),
	PRODUCTION("production");
	
	private final String name;
	
	private Platform(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	public Platform getPreviousPlatform() {
		return ordinal() != 0 ? Platform.values()[ordinal() -1] : null;
	}
	
}
