# SkinClock(스킨클락)

사용자의 생활 상황과 날씨·자외선 정보를 반영해 세안 및 스킨케어 루틴을 안내하는 상황 인지형 알림 서비스. 상세 기획은 [`Docs/SkinClock_SPEC.md`](Docs/SkinClock_SPEC.md), 구현 순서는 [`Docs/IMPLEMENTATION_PLAN.md`](Docs/IMPLEMENTATION_PLAN.md), 백엔드 ERD/API 명세는 [`Docs/BACKEND_DESIGN.md`](Docs/BACKEND_DESIGN.md) 참고.

## 프로젝트 구조

```
Backend/    Spring Boot 4.1.0 (Java 25) + Spring Data JPA + H2
Frontend/   Next.js 16 (정적 export) + Tailwind CSS + TanStack Query + Zustand
Docs/       기획/설계 문서
```

## 실행 환경

| 도구 | 버전 |
|---|---|
| JDK | 25 (Temurin) |
| Node.js | 24 LTS |
| Maven | 불필요 — 저장소에 포함된 Maven Wrapper(`mvnw`/`mvnw.cmd`) 사용 |

## 백엔드 (Backend/)

```bash
cd Backend
./mvnw.cmd package        # 실행 가능한 fat jar 생성 (target/skinclock-backend-*.jar)
java -jar target/skinclock-backend-0.0.1-SNAPSHOT.jar
```

- 기본 포트: `8080`
- H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:skinclock`, 사용자명 `sa`, 비밀번호 없음)
- 인메모리 DB이므로 서버를 재시작하면 데이터가 초기화됩니다.

## 프론트엔드 (Frontend/)

```bash
cd Frontend
cp .env.local.example .env.local   # 필요 시 백엔드 API 주소 수정
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 정적 파일 생성 (Frontend/out/) — Node.js 없이 아무 브라우저/정적 서버에서 실행 가능
```

## 패키징 전략

- **백엔드**: `spring-boot-maven-plugin`이 의존성을 모두 포함한 단일 실행 jar(fat jar)로 패키징합니다. 실행에는 JRE만 있으면 되고, 별도 설치 스크립트가 필요 없습니다.
- **프론트엔드**: `next.config.ts`의 `output: "export"` 설정으로 순수 정적 HTML/CSS/JS(`out/`)로 빌드됩니다. 빌드된 결과물은 Node.js 없이 브라우저에서 바로 열거나 아무 정적 파일 서버에 올리면 동작합니다.
- 즉 **빌드는 JDK/Node가 설치된 개발 PC에서 한 번**, **실행/배포는 최소 요구사항(JRE 또는 브라우저)** 으로 가능하도록 구성했습니다.
