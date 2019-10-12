# versio
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
                <datasource jndi-name="java:jboss/datasources/VersioDS" pool-name="VersioDS">
                    <connection-url>jdbc:postgresql:versio</connection-url>
                    <driver>postgres</driver>
                    <security>
                        <user-name>versio_user</user-name>
                        <password>versio_password</password>
                    </security>
                    <validation>
                        <background-validation>false</background-validation>
                    </validation>
                </datasource>
```

Tested with a Postgresql Database.


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

To run localy:
```
ng serve frontend
```
