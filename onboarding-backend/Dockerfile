# ---- Build stage: compile the Spring Boot jar with Maven + JDK 21 ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests clean package

# ---- Run stage: small JRE image that runs the jar ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render provides $PORT; the app reads it via server.port=${PORT:8081}
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
