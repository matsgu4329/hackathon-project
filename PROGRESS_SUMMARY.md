# SkinClock(스킨클락) 백엔드 개발 진행 상황 요약 문서

 본 문서는 `SkinClock` 프로젝트의 백엔드 기능 명세서 작성 및 초기 아키텍처/패키지 구조 구축까지의 작업 진행 결과를 정리한 문서입니다.

---

## 1. 진행 주요 결과 요약

| 구분 | 주요 결과물 | 상태 |
|---|---|---|
| **기능 요구사항 분석** | `SkinClock_SPEC.md` 기반 백엔드 아키텍처 및 6-Phase 로드맵 수립 | 🟢 완료 |
| **백엔드 기술 명세서** | [`BACKEND_SPEC.md`](file:///c:/Users/jhlee/hackathon-project/BACKEND_SPEC.md) (ERD, API 명세, 비즈니스 규칙, Fallback 알고리즘) | 🟢 완료 |
| **프로젝트 초기화** | Spring Boot 3.4.2 & Java 25, Gradle, H2 In-Memory DB 환경 구성 | 🟢 완료 |
| **패키지 구조 구축** | 계층형 도메인/글로벌/외부 연동 10개 패키지 및 `package-info.java` 생성 | 🟢 완료 |
| **공통 기반 코드 작성** | `BackendApplication`, `BaseTimeEntity`, `JpaConfig`, `ApiResponse` 구현 | 🟢 완료 |

---

## 2. 세부 구현 내역

### 2.1 문서 작성 및 명세화
- **[`BACKEND_SPEC.md`](file:///c:/Users/jhlee/hackathon-project/BACKEND_SPEC.md)**:
  - 6단계 백엔드 개발 로드맵 (Phase 1 ~ Phase 6)
  - JPA 엔티티 간 관계를 표현한 Mermaid ERD 작성
  - RESTful API 12개 엔드포인트 명세 (Request/Response JSON Schema 포함)
  - 개인화 추천 엔진 알고리즘 및 외부 날씨 API 수집 Fallback 처리 메커니즘 설계

### 2.2 빌드 및 환경 설정 파일
- **[`build.gradle`](file:///c:/Users/jhlee/hackathon-project/build.gradle)**:
  - Java 25 Toolchain 적용
  - Spring Boot `3.4.2`
  - 의존성: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `h2`, `lombok`
- **[`settings.gradle`](file:///c:/Users/jhlee/hackathon-project/settings.gradle)**: 프로젝트명 `skinclock-backend`
- **[`application.yml`](file:///c:/Users/jhlee/hackathon-project/src/main/resources/application.yml)**: H2 In-Memory DB(`jdbc:h2:mem:skinclockdb`), H2 콘솔(`/h2-console`), JPA Show SQL 설정

### 2.3 백엔드 패키지 구조 및 클래스

```text
com.skinclock.backend
├── BackendApplication.java       // 메인 실행 클래스 (@EnableScheduling)
├── domain
│   ├── user/                     // 회원 및 최초 질문지 프로필 도메인
│   ├── product/                  // 보유 스킨케어 제품 및 사용 주기 도메인
│   ├── weather/                  // 날씨 & 자외선 정보 저장/조회 도메인
│   ├── recommendation/           // 개인화 스킨케어 추천 엔진 도메인
│   ├── notification/             // 아침/귀가 브리핑 및 웹 알림 도메인
│   └── routine/                  // 루틴 이행 이력 & 통계 도메인
├── global
│   ├── config/
│   │   └── JpaConfig.java        // @EnableJpaAuditing 설정
│   ├── exception/                // 전역 예외 처리 패키지
│   └── common/
│       ├── BaseTimeEntity.java   // JPA 생성일/수정일 공통 매핑 엔티티
│       └── ApiResponse.java      // 공통 API 응답 래퍼 객체
└── external
    └── weather/                  // 외부 날씨 API 연동 및 Fallback 처리
```

---

## 3. 백엔드 개발 로드맵 달성 현황

- [x] **[Phase 1-1] 프로젝트 초기 설정 & 패키지 구조 세팅** (완료)
- [x] **[Phase 1-2] 공통 클래스(`BaseTimeEntity`, `ApiResponse`, `JpaConfig`) 작성** (완료)
- [ ] **[Phase 1-3] 핵심 JPA 엔티티(`User`, `UserProfile`, `Product`, `WeatherInfo`, `Notification`, `RoutineLog`) 작성** (진행 예정)
- [ ] **[Phase 2] 회원, 보유 제품 CRUD 및 최초 질문지 프로필 API 구현**
- [ ] **[Phase 3] 날씨·자외선 정보 수집 스케줄러 & Fallback 시스템 구현**
- [ ] **[Phase 4] 개인화 일일 스킨케어 추천 엔진 구현**
- [ ] **[Phase 5] 아침·귀가 브리핑 알림 & 모의 귀가 이벤트 API 구현**
- [ ] **[Phase 6] 웹 알림 확인 및 루틴 이행 기록 API 구현**

---

## 4. 다음 작업 계획

1. **JPA 도메인 엔티티 클래스 생성**:
   - `User.java`: 회원 엔티티
   - `UserProfile.java`: 피부 타입, 외출 패턴, 기본 루틴 엔티티
   - `Product.java`: 제품명, 단계, 성분 태그, 사용 주기 엔티티
   - `WeatherInfo.java`: 날씨 상태, 자외선 지수, 온도, 습도 엔티티
   - `Notification.java`: 알림 유형, 내용, 처리 상태 엔티티
   - `RoutineLog.java`: 루틴 완료 이력 엔티티
2. **Spring Data JPA Repository 인터페이스 생성**
