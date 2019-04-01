# versioning
Application using :
- Rest
- Server-send events
- JPA
- EJB
- Wildfly 16.0
- Angular 6
- PatternFly/ng 3

## Backend:
Add Datasource to wildfly server:
```xml
<datasource jndi-name="java:/boss/datasources/VersioningDS" pool-name="VersioningDS">
	<connection-url>jdbc:h2:mem:versioning;DB_CLOSE_DELAY=-1</connection-url>
	<driver-class>org.h2.Driver</driver-class>
	<driver>h2</driver>
	<security>
		<user-name>sa</user-name>
		<password>sa</password>
	</security>
	<validation>
		<background-validation>false</background-validation>
	</validation>
</datasource>
```

run with a Wildfly 16.0 running:
```
mvn clean wildfly:deploy
```

## frontend

To initialize :
```
npm install -g @angular/cli
npm install
```

To run local:
```
ng serve frontend
```
