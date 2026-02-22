FROM gradle:8.5-jdk21-alpine AS builder

WORKDIR /build
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle

RUN chmod +x ./gradlew
RUN ./gradlew dependencies

COPY src ./src

RUN ./gradlew bootJar --no-daemon


FROM openjdk:21-jdk-slim

WORKDIR /app

COPY --from=builder /build/build/libs/*.jar app.jar
COPY .env ./

# 애플리케이션 포트 노출
EXPOSE 8088

ENTRYPOINT ["java", "-jar", "app.jar"]