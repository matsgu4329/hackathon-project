# SkinClock 구현 계획서 (Implementation Plan)

> `SkinClock_SPEC.md`(기능 요구사항)와 `frontend.md`(FE PRD)를 바탕으로, 실제 구현 순서를 의존성 기준으로 재정렬한 문서입니다. 백엔드가 없으면 프론트가 붙일 데이터가 없고, 개인 설정이 없으면 추천을 만들 수 없는 식으로 기능 간 선행 관계가 있어 SPEC의 번호 순서(1→6)와 실제 구현 순서는 다릅니다.

> **역할 구분**: 이 문서는 백엔드·프론트엔드가 같은 기능 단위(Phase)로 함께 움직이도록 조율하기 위한 **공통 로드맵**입니다. 각 Phase는 `🔧 백엔드` / `🎨 프론트엔드` 트랙으로 나뉘어 있으며, **백엔드 담당자는 🔧 항목만** 구현하면 됩니다. `🎨` 항목은 프론트 담당자를 위한 참고용으로 남겨둡니다 (API 계약을 미리 알 수 있도록). Phase 0(스캐폴딩)은 인프라 성격이라 이미 양쪽 다 완료해 두었습니다.

---

## 0. 구현 순서 요약

| 순서 | 단계 | SPEC 대응 기능 | 담당 | 비고 |
|---|---|---|---|---|
| Phase 0 | 프로젝트 스캐폴딩 | - | 공통 (완료) | 백엔드/프론트 초기 세팅 |
| Phase 1 | 데이터 모델 설계 | 전체 | 🔧 백엔드 | Entity/DB 스키마 확정 |
| Phase 2 | 사용자 & 온보딩(개인 설정) | 기능 2 | 🔧 백엔드 + 🎨 프론트 | 이후 모든 기능의 입력값 |
| Phase 3 | 보유 제품 및 사용 주기 관리 | 기능 1 | 🔧 백엔드 + 🎨 프론트 | 추천 엔진의 입력값 |
| Phase 4 | 날씨·자외선 정보 수집 | 기능 4 | 🔧 백엔드 + 🎨 프론트 | 추천 엔진의 입력값 |
| Phase 5 | 개인화 일일 추천 엔진 | 기능 3 | 🔧 백엔드 + 🎨 프론트 | 2·3·4의 결과를 종합 |
| Phase 6 | 아침·귀가 브리핑 알림 생성 | 기능 5 | 🔧 백엔드 + 🎨 프론트 | 5의 결과를 알림으로 변환 |
| Phase 7 | 웹 알림 확인 & 이행 기록 | 기능 6 | 🔧 백엔드 + 🎨 프론트 | 6에서 만든 알림을 소비 |
| Phase 8 | 프론트엔드 통합 & 시뮬레이터 | 전체 | 🎨 프론트 전용 | 백엔드 담당자는 해당 없음 |
| Phase 9 | 통합 테스트 & 데모 준비 | 전체 | 공통 | 리스크 대응, 시연 시나리오 |

---

## Phase 0. 프로젝트 스캐폴딩 ✅ 완료 (2026-08-14)

- [x] JDK 25(Temurin), Node.js 24 LTS 설치
- [x] **백엔드 초기화**: Spring Initializr로 Java 25 + Spring Boot 4.1.0 프로젝트 생성 (`Backend/`) — 의존성: Web, Data JPA, H2, Validation. Maven Wrapper(`mvnw`/`mvnw.cmd`) 포함되어 팀원은 Maven 별도 설치 불필요
- [x] **프론트엔드 초기화**: Next.js 16 + TypeScript + Tailwind CSS (`Frontend/`), TanStack Query·Zustand 설치
- [x] **패키징 전략 확정**: 백엔드는 `spring-boot-maven-plugin` fat jar(JRE만 있으면 실행), 프론트엔드는 `output: "export"` 정적 빌드(Node 없이 브라우저에서 실행) — 상세는 [`README.md`](../README.md)
- [x] **CORS 설정**: `Backend/src/main/java/com/skinclock/config/CorsConfig.java` — 정적 프론트엔드(별도 오리진)에서 `/api/**` 호출 허용
- [x] **빌드 검증**: `./mvnw.cmd package` → jar 실행 후 기동 확인, `npm run build` → `out/` 정적 파일 생성 확인
- [ ] `application.yml` 프로파일(local/demo) 분리 — 현재는 `application.properties` 단일 설정, 필요 시 Phase 2 착수 전 정리
- [ ] API 규약 확정 — ERD와 함께 [`BACKEND_DESIGN.md`](BACKEND_DESIGN.md) §0에 이미 정의됨 (응답 포맷, 날짜 포맷, 인증 방식)

---

## Phase 1. 데이터 모델 설계 ✅ (설계 완료) — 🔧 백엔드

> 상세 ERD와 엔티티 필드 정의, API 명세는 별도 문서 [`BACKEND_DESIGN.md`](BACKEND_DESIGN.md)로 분리했습니다. 아래는 요약입니다.

| 엔티티 | 주요 필드 | 관련 기능 |
|---|---|---|
| `User` | id, clientUserId(FE 발급 UUID, 의사 인증) | 전체 |
| `UserProfile` | skinType, outingPatternType(빈도/시간 or 불규칙), preferredNotificationTime, baseRoutineItems | 기능 2 |
| `Product` | id, userId, name, usageStep, ingredientTags, cycleType/cycleIntervalDays/cycleWeekdays, nightOnly, nextUseDate | 기능 1 |
| `WeatherSnapshot` | weatherState, uvIndex, humidity, fetchedAt(기준 시각), isFallback | 기능 4 |
| `DailyRecommendation` / `RecommendationStep` | userId, date, weatherSnapshotId, cleansingMethod / stepOrder, timeSlot, description, warningBadge | 기능 3 |
| `Notification` | id, userId, type(MORNING_BRIEFING/HOMECOMING_BRIEFING/PRODUCT_CYCLE), status(PENDING/COMPLETED/LATER/DISMISSED) | 기능 5, 6 |
| `RoutineLog` | userId, notificationId, date, status, completedAt | 기능 6 |

**작업 항목**
- [x] 엔티티 및 연관관계(ERD) 확정 → `BACKEND_DESIGN.md` §1~2
- [x] API 엔드포인트 명세 확정 → `BACKEND_DESIGN.md` §3
- [ ] JPA Entity 클래스 작성 (실행 환경 준비 완료 → Phase 2에서 착수)
- [ ] H2 초기 스키마(`schema.sql`/`data.sql` 또는 `ddl-auto`) 결정

---

## Phase 2. 사용자 & 온보딩(개인 설정) — SPEC 기능 2 ✅ 백엔드 완료 (2026-08-14)

> 이후 모든 추천 로직의 입력값이므로 가장 먼저 구현합니다.

### 🔧 백엔드
1. [x] `User`/`UserProfile` 엔티티 + Repository 작성 (`com.skinclock.user`, `com.skinclock.profile`)
2. [x] `UserProfile` 등록 API (`POST /api/profile`): 피부 타입, 외출 패턴(빈도/시간 또는 불규칙), 기본 루틴 저장
3. [x] `UserProfile` 조회/수정 API (`GET`/`PUT /api/profile`)
4. [x] 유효성 검증: 최초 실행 여부 판별(온보딩 완료 플래그) — `onboardingCompleted`
5. [x] 공통 응답/에러 포맷(`ApiResponse`, `ErrorResponse`, `GlobalExceptionHandler`) 도입 — 이후 모든 Phase에서 재사용
6. [x] `java -jar` 기동 후 curl로 GET/POST/PUT/검증오류/헤더누락/사용자별 격리 스모크 테스트 통과

### 🎨 프론트엔드 (참고용)
- 온보딩 위저드(`/onboarding`) — 피부 타입 선택 → 외출 패턴 설정 → 기본 루틴/제품 간이 입력 → 완료. 위 API 3종(등록/조회/수정)을 그대로 사용

**수용 기준 매핑**: SPEC 2번 수용 기준 1~4 충족

---

## Phase 3. 보유 제품 및 사용 주기 관리 — SPEC 기능 1 ✅ 백엔드 완료 (2026-08-14)

### 🔧 백엔드
1. [x] `Product` 엔티티 + Repository, CRUD API (등록/조회/수정/삭제) — `com.skinclock.product`
2. [x] 성분·기능 태그 관리 (`IngredientTag`) — 레티놀/AHA_BHA 태그 시 `nightOnly` 자동 `true`
3. [x] 사용 주기(cycleType) 계산 로직: 매일 / N일에 1번 / 특정 요일 → `nextUseDate` 산출. **저장 필드가 아니라 조회 시점(`today` 기준)에 동적 계산**하도록 구현해 날짜가 지나도 값이 stale해지지 않음(`NextUseDateCalculator`) — `BACKEND_DESIGN.md`의 "저장 필드" 설계에서 일부러 벗어난 부분
4. [x] 사용자별 데이터 격리 검증 (`findByIdAndUser_ClientUserId`로 소유자 아니면 404)
5. [x] 교차 필드 검증: `EVERY_N_DAYS`인데 간격 없음 / `SPECIFIC_WEEKDAYS`인데 요일 없음 → 400
6. [x] curl 스모크 테스트: CRUD, 자동 nightOnly, 3가지 주기 계산, 검증 실패, 타 사용자 소유권 격리(404) 모두 통과

### 🎨 프론트엔드 (참고용)
- `/products` 화면 — 제품 카드 목록, 추가/수정 모달, 성분 감지 안내(Smart Badge)

**수용 기준 매핑**: SPEC 1번 수용 기준 1~4 충족

---

## Phase 4. 날씨·자외선 정보 수집 — SPEC 기능 4 ✅ 백엔드 완료 (2026-08-14, 팀원 담당)

> 외부 API 연동은 리스크가 크므로 Phase 2/3와 병행 착수 권장 (일정상 여유가 있다면 가장 먼저 붙여도 무방).

### 🔧 백엔드
1. [x] 외부 날씨/자외선 API 연동: **기상청(KMA) API 우선, 서비스키 없거나 실패 시 Open-Meteo로 자동 폴백** (`com.skinclock.weather.client`)
2. [x] `WeatherScheduler` — 앱 시작 시 1회 + 이후 `@Scheduled(fixedRate = 1h)`로 자동 수집
3. [x] `WeatherSnapshot` 엔티티 (weatherState, uvIndex, humidity, temperature, 좌표, fetchedAt, isFallback, source)
4. [x] **장애 대응**: KMA 실패 → Open-Meteo → 그마저 실패하면 마지막 정상 스냅샷을 fallback 플래그로 재저장, 이력 자체가 없으면 `WeatherSnapshot.defaultFallback()` 하드코딩 기본값
5. [x] `GET /api/weather/current`, `POST /api/weather/refresh`
6. [x] (스펙 이상 추가 구현) `POST /api/weather/mock` — 프론트 시뮬레이터/데모용 날씨·UV 수동 주입 엔드포인트

### 🎨 프론트엔드 (참고용)
- 대시보드 상단 날씨·자외선 위젯(`<WeatherUvWidget/>`) — UV 등급별 컬러 배지, 갱신 시각 표시

**수용 기준 매핑**: SPEC 4번 수용 기준 1~4 충족

**주의**: MVP 데모 안정성을 위해 실제 외부 API 실패에 대비한 하드코딩 기본값을 Phase 4 초반에 반드시 확보해둘 것 (데모 중 외부 API 장애가 곧 전체 시연 실패로 이어지지 않도록).

---

## Phase 5. 개인화 일일 스킨케어 추천 엔진 — SPEC 기능 3 ✅ 백엔드 완료 (2026-08-14, 실제 날씨 연동까지 완료)

> Phase 2(개인 설정) + Phase 3(보유 제품) + Phase 4(날씨) 결과를 종합하는 핵심 로직. Phase 4가 끝나기 전에 mock 날씨(CLEAR, UV 7)로 먼저 구현한 뒤, Phase 4가 main에 merge된 직후 `feature/phase5-recommendation`에 `origin/main`을 merge하고 실제 날씨로 교체 완료.

### 🔧 백엔드
1. [x] 추천 규칙 정의 및 구현 (`com.skinclock.recommendation.RecommendationService`): UV≥6 → 자외선 차단 강조 / 날씨 DRY → 보습 한 겹 추가 / 레티놀·AHA_BHA 보유 제품(Product.nightOnly) → NIGHT 슬롯 + `NIGHT_ONLY` 배지로 취침 전 안내
2. [x] 추천 생성 로직: 세안법(피부타입별 문구) + 루틴 순서(`stepOrder`) 산출 — `DailyRecommendation`/`RecommendationStep` 엔티티
3. [x] 제품 사용 주기 도래 여부 반영 (Phase 3의 `Product.nextUseDate(today)` 그대로 재사용)
4. [x] 결과에 "일반적인 생활 관리 안내" 문구(면책 조항) 포함 — `disclaimer` 필드
5. [x] `GET /api/recommendations/today` (당일 1건 캐시, 없으면 생성) / `POST /api/recommendations/today/refresh` (강제 재계산)
6. [x] **Phase 4 연동 완료**: `TodayWeatherProvider` 인터페이스의 구현체를 `MockTodayWeatherProvider`(고정값) → `RealTodayWeatherProvider`(`com.skinclock.weather.WeatherService` 호출, `WeatherState`→`WeatherCondition` 매핑)로 교체. `RecommendationService`는 전혀 수정하지 않음 — 설계한 대로 인터페이스 뒤에서만 교체됨
7. [x] curl 스모크 테스트: 온보딩 전 404, 실제 Open-Meteo 날씨(CLOUDY·UV1)로 추천 생성 확인, `/api/weather/mock`으로 UV 9 주입 후 refresh 시 자외선 차단 문구로 즉시 반영 확인, 레티놀 NIGHT_ONLY 배지·캐시·타 사용자 격리 모두 재확인

### 🎨 프론트엔드 (참고용)
- 대시보드(`/dashboard`) 오늘의 추천 루틴 카테고리(아침/귀가 후/취침 전) 및 체크리스트

**수용 기준 매핑**: SPEC 3번 수용 기준 1~4 충족

---

## Phase 6. 아침·귀가 브리핑 알림 생성 — SPEC 기능 5 ✅ 백엔드 완료 (2026-08-14, 팀원 담당)

> Phase 5의 추천 결과를 알림 형태로 변환.

### 🔧 백엔드
1. [x] 아침 브리핑 생성 로직 (`NotificationService.createMorningBriefing`): 날씨·자외선 정보 + 권장 세안법 + 아침 루틴 요약 포함, `POST /api/notifications/morning-briefing/trigger`
2. [x] 귀가 브리핑 생성 로직 (`createHomecomingBriefing`): 세안/저녁 루틴 안내 포함, `POST /api/situations/homecoming`
3. [x] `NotificationScheduler` — 매분 전체 `UserProfile` 순회, `preferredNotificationTime`(기본 08:00) 도달 시 아침 브리핑 + 제품 주기 알림 자동 생성
4. [x] 중복 생성 방지: `(user, type, date)` / `(user, type, product, date)` 조합 조회 후 이미 있으면 기존 알림 그대로 반환

### 🎨 프론트엔드 (참고용)
- 귀가 모의 입력 버튼(`<ScenarioSimulatorBar/>`) → `POST /api/situations/homecoming` 호출 → 알림 생성 확인

**수용 기준 매핑**: SPEC 5번 수용 기준 1~4 충족

---

## Phase 7. 웹 알림 확인 및 루틴 이행 기록 — SPEC 기능 6 ✅ 백엔드 완료 (2026-08-14, Phase 6 병합 완료)

> Phase 6에서 생성된 알림을 사용자가 소비하고 처리하는 마지막 단계. Phase 6이 main에 없는 상태에서 병행 진행하다가, Phase 6이 merge된 뒤 `feature/phase7-notification-history`에 `origin/main`을 merge하며 예상했던 대로 `Notification.java`/`NotificationRepository.java`/`NotificationController.java`/`NotificationService.java` 4개 파일에서 충돌이 나 수동으로 합쳤습니다. `NotificationStatus`/`NotificationType`/`dto/NotificationResponse.java`는 두 브랜치가 완전히 동일하게 작성해서 충돌 없이 합쳐짐.

**병합 시 확정한 것**: `Notification` 엔티티는 Phase 6 버전(명시적 `date` 필드, `updateStatus()` 메서드명)을 채택. `NotificationController`는 클래스 레벨 매핑 없이 절대경로 방식(Phase 6 스타일)으로 통일, Phase 7의 목록/상태변경 엔드포인트를 같은 파일에 추가. `NotificationService`는 Phase 6의 생성 로직(아침/귀가 브리핑, 제품주기) + Phase 7의 조회/상태변경(`list`, `updateStatus`)을 한 클래스에 합치고 `RoutineLogRepository`를 생성자에 추가.

### 🔧 백엔드
1. [x] `Notification` 엔티티/Repository/enum — Phase 6·7 공동 소유로 확정 (병합 완료)
2. [x] 알림 목록 조회 API (`GET /api/notifications`, `status`/`type` 쿼리 필터)
3. [x] 알림 상태 처리 API (`PATCH /api/notifications/{id}/status`): COMPLETED / LATER / DISMISSED (PENDING으로는 되돌릴 수 없도록 검증)
4. [x] `RoutineLog` 엔티티/Repository (`com.skinclock.routine`, notification당 1건 upsert) — 날짜, 알림 유형, 처리 시각, 완료 상태 기록
5. [x] 이행 기록 조회 API (`GET /api/routine-logs?from&to`, `GET /api/routine-logs/summary?yearMonth`) — 캘린더 히트맵용 일자별 COMPLETE/PARTIAL/NONE, 스트릭(최근 90일 기준 연속 COMPLETE 일수), 월간 완료율 계산
6. [x] 사용자별 데이터 격리: 소유자 아닌 알림 상태 변경 시 404
7. [x] **검증**: 병합 전엔 MockMvc 통합 테스트(`NotificationRoutineLogIntegrationTest`)로 시드 데이터 기반 검증, 병합 후엔 실제 서버로 온보딩→제품 등록→아침 브리핑 트리거(중복 방지 확인)→귀가 브리핑→목록 조회→상태 변경(COMPLETED/LATER)→월간 요약까지 curl로 end-to-end 재확인. `./mvnw.cmd test` 2/2 통과
8. [ ] (선택) 웹 푸시 구독 저장 API (`POST /api/push/subscriptions`) — 스트레치 목표, 미구현

### 🎨 프론트엔드 (참고용)
- `/notifications`(알림 센터), `/history`(이행 리포트, 캘린더 히트맵)
- 웹 푸시 3단계 폴백 구현 (frontend.md 4.2): 브라우저 지원 체크 → 권한 허용 시 OS 네이티브 푸시 → 미지원/거부 시 인앱 토스트+드로어 대체. 전부 프론트 로직이며 백엔드는 구독 저장 API만 제공

**수용 기준 매핑**: SPEC 6번 수용 기준 1~4 충족

---

## Phase 8. 프론트엔드 통합 & 시뮬레이터 마감 — 🎨 프론트 전용 (백엔드 담당자는 해당 없음)

`frontend.md`에 정의된 화면/컴포넌트를 백엔드 API와 연결합니다.

1. Zustand `SituationState` 스토어 구현 (모의 귀가/UV/날씨 상태) — Phase 6 트리거와 연동
2. TanStack Query로 서버 데이터 캐싱/동기화 (제품, 추천, 알림, 이행 기록)
3. `localStorage`/`IndexedDB` 동기화 — H2 재시작 시에도 온보딩/제품 데이터 UX 유지 (frontend.md 6.2)
4. 반응형 레이아웃(Mobile First) 및 44px 터치 타겟 적용
5. 의료 면책 조항 배너 전 화면 하단 노출

---

## Phase 9. 통합 테스트 & 데모 준비 — 공통

1. **엔드투엔드 시나리오 테스트**: 온보딩 → 제품 등록 → 귀가 모의 입력 → 알림 수신 → 루틴 완료 처리 → 히스토리 확인
2. **리스크 대응 점검** (SPEC 리스크 섹션 기준):
   - 외부 날씨 API 장애 시 기본값 폴백 동작 확인 (🔧 백엔드)
   - 웹 푸시 미지원/거부 환경에서 인앱 알림 정상 동작 확인 (🎨 프론트)
   - 하루 알림 상한 및 중복 알림 방지 규칙 동작 확인 (🔧 백엔드)
   - H2 인메모리 DB 재시작 시 데이터 소실 안내 문구 노출 확인 (🎨 프론트)
3. **핵심 지표(KPI) 측정 포인트 로깅**: 루틴 완료율, 알림 반응률, 귀가 알림 성공률 등 SPEC 핵심 지표 계산에 필요한 이벤트 로그 확보 (🔧 백엔드)
4. 데모 리허설: 발표 중 실시간으로 귀가/UV 변경 시연 가능한지 확인 (공통)

---

## 부록: 기능-Phase 매핑 표 (SPEC 원문 번호 기준)

| SPEC 기능 번호 | 기능명 | 구현 Phase |
|---|---|---|
| 1 | 보유 제품 및 사용 주기 관리 | Phase 3 |
| 2 | 최초 질문지 및 개인 루틴 설정 | Phase 2 |
| 3 | 개인화 일일 스킨케어 추천 | Phase 5 |
| 4 | 날씨·자외선 정보 시간별 수집·갱신 | Phase 4 |
| 5 | 아침·귀가 브리핑 알림 | Phase 6 |
| 6 | 웹 알림 확인 및 루틴 이행 기록 | Phase 7 |
