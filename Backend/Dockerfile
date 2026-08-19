# 1단계: Maven 빌드 (Java 25 JDK)
FROM eclipse-temurin:25-jdk-noble AS build
WORKDIR /app

# Maven 래퍼 및 설정 복사
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# 의존성 다운로드 캐싱
RUN ./mvnw dependency:go-offline -B || true

# 소스 코드 복사 및 패키징
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests

# 2단계: 실행 경량 이미지 (Java 25 JRE)
FROM eclipse-temurin:25-jre-noble
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
