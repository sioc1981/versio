package fr.sioc1981.versio.backend.security;

public final class Security {
	
	public final class Domain {
		public static final String DOMAIN = "KeycloakDomain";
		
		private Domain() {
			super();
		}
	}
	
	public final class Role {
		private static final String PREFIX = "versio.";
		public static final String ADMIN_ONLY = PREFIX + "admin_only";
		public static final String BACKEND = PREFIX + "backend";
		public static final String USER = PREFIX + "user";
		
		private Role() {
			super();
		}
	}
	
	private Security() {
		super();
	}
	
}
