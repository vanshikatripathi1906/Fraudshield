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
EXPOSE 5000
ENV PORT=5000
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-5000} -jar app.jar"]
