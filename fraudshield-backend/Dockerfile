# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Install dos2unix to ensure mvnw executes cleanly across platforms
RUN apk add --no-cache dos2unix

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN dos2unix mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/fraudshield-backend-1.0.0.jar app.jar

# Render defaults to port 10000 for web services.
EXPOSE 10000
ENV PORT=10000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-10000} -jar app.jar"]
