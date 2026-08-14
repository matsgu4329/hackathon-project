# SkinClock 진행 상황 공유 (2026-08-14 기준)

> 팀원들이 지금까지 뭐가 만들어졌고 앞으로 뭘 해야 하는지 빠르게 파악할 수 있도록 정리한 문서입니다. 더 자세한 내용은 하단 "참고 문서" 링크를 확인하세요.

---

## 한눈에 보기

- **백엔드(Spring Boot)와 프론트엔드(Next.js) 프로젝트 뼈대가 만들어졌고, 실제로 빌드·실행이 되는 상태**입니다.
- 백엔드는 **온보딩(개인 설정) API**와 **보유 제품 관리 API** 두 기능이 구현되어 실제로 동작합니다(curl로 직접 테스트 완료).
- 프론트엔드는 아직 초기 스캐폴딩 상태이고, 실제 화면(온보딩/대시보드/제품 관리 등)은 만들어지지 않았습니다.
- 앞으로 남은 백엔드 작업은 **날씨·자외선 수집 → 일일 추천 → 알림 생성 → 알림 처리/이행 기록** 순서로 진행할 예정입니다.

---

## 지금까지 한 일

### 1. 개발 환경 & 프로젝트 뼈대 구성

- JDK 25(Temurin), Node.js 24 LTS를 설치했습니다.
- `Backend/`: Spring Boot 4.1.0 + Java 25 + Spring Data JPA + H2 프로젝트를 생성했습니다.
  - Maven이 별도로 설치되어 있지 않아도 됩니다 — 프로젝트에 **Maven Wrapper**(`mvnw`, `mvnw.cmd`)가 포함되어 있어서 그냥 `./mvnw.cmd package`만 실행하면 됩니다.
  - 최종 결과물은 **의존성이 전부 포함된 단일 실행 jar(fat jar)**로 빌드됩니다. 즉 `java -jar` 한 줄이면 실행 가능해서, 팀원 PC에는 JDK(정확히는 JRE)만 있으면 됩니다.
- `Frontend/`: Next.js 16 + TypeScript + Tailwind CSS + TanStack Query + Zustand로 프로젝트를 생성했습니다.
  - `next.config.ts`에 `output: "export"`를 설정해 **정적 HTML/CSS/JS로 빌드**되도록 했습니다. 빌드 결과물(`Frontend/out/`)은 Node.js 없이 브라우저에서 바로 열거나 아무 정적 서버에 올려도 동작합니다.
- 백엔드와 프론트엔드가 서로 다른 주소(오리진)에서 실행되므로, 백엔드에 **CORS 설정**을 추가해 프론트에서 API를 호출할 수 있게 했습니다.

> 왜 이렇게 했나? 빌드는 개발자 PC(JDK/Node 설치)에서 한 번만 하고, 실행/배포는 최소한의 조건(JRE만 있으면 백엔드 실행, 브라우저만 있으면 프론트 실행)으로 가능하게 하기 위해서입니다.

### 2. 설계 문서 작성

실제 코드를 짜기 전에 데이터 구조와 API를 먼저 정리했습니다.

- [`Docs/BACKEND_DESIGN.md`](BACKEND_DESIGN.md): ERD(엔티티 관계도), 각 엔티티의 필드 정의, REST API 명세(엔드포인트/요청/응답), 공통 규약을 담고 있습니다.
- **인증 방식**: 회원가입/로그인 화면 없이, 프론트가 최초 접속 시 UUID(`clientUserId`)를 만들어 `localStorage`에 저장하고, 이후 모든 API 요청에 `X-User-Id` 헤더로 실어 보냅니다. 백엔드는 이 값으로 사용자를 구분합니다(없으면 자동 생성).

### 3. 온보딩(개인 설정) API — 구현 완료

사용자의 피부 타입, 외출 패턴, 선호 알림 시간, 기본 루틴을 저장/조회/수정하는 기능입니다.

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/profile` | 내 개인 설정 조회 (아직 설정 안 했으면 `onboardingCompleted: false`) |
| POST | `/api/profile` | 최초 온보딩 저장 |
| PUT | `/api/profile` | 개인 설정 수정 |

### 4. 보유 제품 관리 API — 구현 완료

사용자가 가진 스킨케어 제품과 사용 주기를 등록/관리하는 기능입니다.

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/products` | 내 제품 목록 조회 |
| GET | `/api/products/{id}` | 제품 단건 조회 |
| POST | `/api/products` | 제품 등록 |
| PUT | `/api/products/{id}` | 제품 수정 |
| DELETE | `/api/products/{id}` | 제품 삭제 |

특징:
- 제품에 **레티놀/AHA·BHA 성분 태그**를 넣으면 자동으로 "밤 전용(nightOnly)"으로 분류됩니다.
- 사용 주기(매일 / N일마다 / 특정 요일)에 따라 **다음 사용 권장일**을 자동 계산해서 응답에 포함합니다.
- 다른 사용자의 제품에는 접근할 수 없습니다(조회 시 404).

두 기능 모두 서버를 직접 띄운 뒤 curl로 정상/에러 케이스를 전부 확인했습니다 (등록·조회·수정·삭제, 입력값 검증 실패, 사용자별 데이터 격리 등).

---

## 지금 상태로 직접 실행해보는 방법

```bash
cd Backend
./mvnw.cmd package
java -jar target/skinclock-backend-0.0.1-SNAPSHOT.jar
```

- 서버가 `http://localhost:8080`에서 뜹니다.
- H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:skinclock`, 사용자 `sa`, 비밀번호 없음)
- 예시 호출:
  ```bash
  curl http://localhost:8080/api/profile -H "X-User-Id: test-user"
  ```

프론트엔드는 아직 화면이 없어서 `npm run dev`로 띄워도 Next.js 기본 페이지만 보입니다.

---

## 앞으로 할 일

전체 순서와 상세 내용은 [`Docs/IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)에 Phase별로 정리되어 있습니다. 각 Phase는 `🔧 백엔드`와 `🎨 프론트엔드` 항목으로 나뉘어 있어서, 담당자별로 뭘 하면 되는지 바로 확인할 수 있습니다.

### 백엔드 (남은 작업)

| Phase | 내용 |
|---|---|
| Phase 4 | 날씨·자외선 정보 외부 API 연동, 1시간마다 자동 수집, 장애 시 기본값 대체 |
| Phase 5 | 개인 설정 + 보유 제품 + 날씨 정보를 종합한 **일일 추천 로직** |
| Phase 6 | 아침 브리핑 / 귀가 브리핑 알림 생성 로직 |
| Phase 7 | 알림 목록 조회, 완료/나중에/닫힘 처리, 이행 기록(히스토리) API |
| Phase 9 | 통합 테스트, 리스크 대응 점검 |

### 프론트엔드 (전체 작업 — 아직 시작 전)

- 온보딩 위저드, 대시보드, 제품 관리, 알림 센터, 이행 리포트 등 5개 화면 (자세한 화면 설계는 [`Docs/frontend.md`](frontend.md) 참고)
- 위에서 이미 완성된 `/api/profile`, `/api/products` API를 바로 연동해서 **온보딩 화면과 제품 관리 화면은 지금 바로 개발을 시작할 수 있습니다.**
- 나머지 화면(대시보드, 알림 센터 등)은 백엔드 Phase 5~7이 끝나야 실제 데이터로 연동 가능하지만, 화면 UI 자체는 목(mock) 데이터로 미리 만들어둘 수 있습니다.
- API 요청 시 `X-User-Id` 헤더에 프론트에서 생성한 UUID를 실어 보내야 한다는 점 참고해주세요 (`Docs/BACKEND_DESIGN.md` §0.1).

---

## 참고 문서

| 문서 | 내용 |
|---|---|
| [`Docs/SkinClock_SPEC.md`](SkinClock_SPEC.md) | 원본 기획서 (기능 요구사항, 수용 기준) |
| [`Docs/frontend.md`](frontend.md) | 프론트엔드 화면/컴포넌트 상세 설계 |
| [`Docs/BACKEND_DESIGN.md`](BACKEND_DESIGN.md) | 백엔드 ERD, API 명세, 공통 규약 |
| [`Docs/IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) | 전체 구현 순서 (Phase 0~9, 담당자별 구분) |
| [`README.md`](../README.md) | 프로젝트 실행 방법, 패키징 전략 |

---

## 개발 시작 체크리스트

팀 구성: **프론트엔드 담당 1명**, **백엔드 담당 2명**. 아래에서 본인 파트를 찾아 프롬프트를 순서대로 Agent(Claude Code 등)에게 붙여넣으면 됩니다. 각 프롬프트는 이전 단계 결과물을 전제로 하므로 순서를 건너뛰지 마세요.

> ⚠️ **3명 모두 시작 전에 지켜주세요** (2026-08-14: 백엔드 팀원이 이걸 안 지켜서 저장소 루트에 중복 프로젝트가 생겼다가 정리된 적이 있습니다):
> 1. 작업 시작 전 **반드시 `git pull origin main`으로 최신 상태를 받은 뒤** 시작하세요.
> 2. 백엔드는 **`Backend/` 폴더 안에서만** 작업합니다. 저장소 루트나 다른 위치에 새 프로젝트(`build.gradle`, 새 `src/` 등)를 만들지 마세요.
> 3. 본인 이름을 딴 새 브랜치를 만들어 작업하고, 끝나면 main으로 병합(PR 또는 merge)하세요. `main`에 바로 커밋하지 마세요.

---

### 🎨 프론트엔드 담당자용

**0) 브랜치 준비**
```
git checkout main && git pull origin main
git checkout -b feature/frontend-onboarding-products
```

**1) 개발 환경 확인**
```
Frontend/ 프로젝트에서 npm install과 npm run dev를 실행해서 개발 서버가 정상적으로 뜨는지 확인해줘.
문제가 있으면 원인을 알려줘.
```

**2) 온보딩 화면 구현**
```
Docs/frontend.md의 "1) 온보딩 및 최초 질문지 화면" 섹션과 Docs/BACKEND_DESIGN.md의
GET/POST/PUT /api/profile API 명세를 읽고, Frontend/ 프로젝트에 /onboarding 페이지를 구현해줘.

- 피부 타입, 외출 패턴(빈도/시간 또는 불규칙), 기본 루틴을 입력받는 위저드 형태로 만들어줘.
- 완료 시 POST /api/profile을 호출해줘. 요청 헤더 X-User-Id에는 localStorage에 저장된
  UUID를 실어 보내고, 없으면 crypto.randomUUID()로 만들어서 저장한 뒤 사용해줘.
- 백엔드는 http://localhost:8080에서 실행 중이라고 가정하고, Frontend/.env.local.example의
  NEXT_PUBLIC_API_BASE_URL을 사용해줘.
```

**3) 보유 제품 관리 화면 구현**
```
Docs/frontend.md의 "3) 보유 제품 및 사용 주기 관리" 섹션과 Docs/BACKEND_DESIGN.md의
/api/products API 명세를 읽고, /products 페이지를 구현해줘.

- 제품 목록 조회(GET), 등록/수정 모달(POST/PUT), 삭제(DELETE) 기능을 만들어줘.
- 레티놀/AHA_BHA 태그를 선택하면 백엔드가 nightOnly:true를 내려주니, 이 값을 보고
  "밤 전용" 안내 배지를 화면에 표시해줘.
```

**4) 시뮬레이터 상태 관리 + 대시보드 뼈대**
```
Docs/frontend.md 4.1절에 정의된 Zustand SituationState 스토어를 구현하고,
/dashboard 페이지의 뼈대를 만들어줘.

아직 백엔드의 추천/알림 API(Phase 5~7)가 없으니, 해당 데이터는 목(mock)으로 채워두고
TanStack Query 훅으로 분리해서 나중에 실제 API로 쉽게 교체할 수 있게 해줘.
```

---

### 🔧 백엔드 팀원용 (새로 합류)

> ⚠️ **중요**: 백엔드 프로젝트는 `Backend/` 폴더 **하나만** 사용합니다(Maven, Spring Boot 4.1.0, `com.skinclock.*` 패키지). 저장소 루트에 별도로 `build.gradle`/`src/`를 만들어 새 프로젝트를 초기화하지 마세요 — 실제로 그렇게 커밋된 적이 있어서(2026-08-14) 정리했습니다. `Backend/`에는 이미 온보딩·제품 API가 동작하는 상태이니, 새로 합류하면 반드시 그 위에서 이어가 주세요.

**0) 저장소 받기 + 브랜치 + 개발 환경 준비**

먼저 사람이 직접 최신 상태를 받고 본인 브랜치를 만들어주세요 (아직 로컬에 저장소가 없다면 clone부터).
```
git clone https://github.com/matsgu4329/hackathon-project.git   # 이미 있으면 생략
cd hackathon-project
git checkout main && git pull origin main
git checkout -b feature/phase4-weather   # 또는 feature/phase5-recommendation, 본인이 맡을 phase로
```

그다음 아래 프롬프트를 Agent에게 붙여넣으면 환경 설치부터 빌드 확인까지 자동으로 해줍니다.
```
이 저장소(SkinClock)의 Backend/ 프로젝트를 빌드하고 실행할 수 있는 환경을 준비해줘.
지금 git 브랜치가 main이 아니라 feature/... 브랜치인지 먼저 확인해줘 (git branch --show-current).
main이면 작업을 시작하지 말고 나한테 알려줘 — 브랜치를 먼저 만들어야 해.

- JDK 25(Temurin)가 설치되어 있는지 확인하고, 없으면 설치해줘
  (Windows라면 winget install --id EclipseAdoptium.Temurin.25.JDK -e --accept-package-agreements --accept-source-agreements).
- Backend/ 디렉토리에서 ./mvnw.cmd package 로 빌드가 되는지 확인해줘 (Maven은 따로 설치할 필요 없음, mvnw가 알아서 처리함).
- java -jar target/skinclock-backend-0.0.1-SNAPSHOT.jar 로 서버를 띄운 뒤,
  curl http://localhost:8080/api/profile -H "X-User-Id: test" 를 호출해서 정상 응답이 오는지 확인해줘.
- 확인 후 Docs/PROGRESS.md, Docs/BACKEND_DESIGN.md, Docs/IMPLEMENTATION_PLAN.md를 읽고
  지금까지 뭐가 구현됐는지 요약해줘.
```

**1) 작업 나누기 (사람이 직접 조율)**

Phase 5(추천 로직)는 원래 Phase 4(날씨 API)가 끝나야 완전해지지만, **mock 날씨 값으로 먼저 개발을 시작할 수 있습니다.** 그래서 백엔드 두 명이 아래 두 작업을 동시에, 각자 다른 브랜치에서 진행할 수 있습니다. 팀원과 상의해서 둘 중 하나를 맡아주세요 (나머지 하나는 내가 진행).

**Phase 4를 맡는 경우** (브랜치: `feature/phase4-weather`)
```
지금 작업 중인 브랜치가 main이 아니라 feature/phase4-weather인지 먼저 확인해줘. 아니면 멈추고 알려줘.
이 저장소의 Backend/ 프로젝트 안에서만 작업해줘 — 새 프로젝트를 만들거나 저장소 루트를 건드리지 마.

Docs/IMPLEMENTATION_PLAN.md의 Phase 4(날씨·자외선 정보 수집)와
Docs/BACKEND_DESIGN.md의 §2.4(WeatherSnapshot), §3.3(API)을 읽고 구현해줘.

- WeatherSnapshot 엔티티와 Repository를 추가해줘.
- 외부 날씨/자외선 API를 조사해서 연동하고, @Scheduled로 1시간마다 자동 수집하게 해줘.
- 외부 API 실패 시 마지막 정상 데이터 또는 사전 정의 기본값으로 폴백하는 로직을 넣어줘.
- GET /api/weather/current, POST /api/weather/refresh 엔드포인트를 만들어줘.
- 다 만든 뒤 서버를 직접 띄워서 curl로 정상 동작을 확인해줘.
- Phase 2(com.skinclock.user, com.skinclock.profile)와 Phase 3(com.skinclock.product)에서 쓴
  패키지 구조, ApiResponse/ErrorResponse 공통 응답 포맷, X-User-Id 기반 사용자 조회 방식을
  그대로 따라줘 (기존 코드가 참고 예시).
```

**Phase 5를 맡는 경우 (mock 날씨로 먼저 시작, 브랜치: `feature/phase5-recommendation`)**
```
지금 작업 중인 브랜치가 main이 아니라 feature/phase5-recommendation인지 먼저 확인해줘. 아니면 멈추고 알려줘.
이 저장소의 Backend/ 프로젝트 안에서만 작업해줘 — 새 프로젝트를 만들거나 저장소 루트를 건드리지 마.

Docs/IMPLEMENTATION_PLAN.md의 Phase 5(개인화 일일 스킨케어 추천)와
Docs/BACKEND_DESIGN.md §2.5(DailyRecommendation/RecommendationStep), §3.4(API)를 읽고 구현해줘.

- Phase 4(WeatherSnapshot)가 아직 없을 수 있으니, 그 경우 UV/날씨를 임의의 값으로 가정하고
  먼저 추천 규칙과 API 뼈대를 만들어줘. 나중에 실제 WeatherSnapshot으로 쉽게 교체할 수 있도록
  날씨 조회 부분을 별도 메서드/클래스로 분리해줘.
- 추천 규칙 예시: UV 높음 → 아침 자외선 차단 강조 / 건조 → 보습 중심 / 레티놀 보유 제품(Product.nightOnly) → 취침 전 사용 안내.
- 결과에 "일반적인 생활 관리 안내" 문구(면책 조항)를 포함해줘.
- GET /api/recommendations/today 엔드포인트를 만들고 서버를 띄워 curl로 확인해줘.
- Phase 2/3에서 쓴 패키지 구조와 ApiResponse/ErrorResponse 공통 응답 포맷을 그대로 따라줘.
```

> 두 작업 모두 `com.skinclock.product.Product`, `com.skinclock.profile.UserProfile`을 읽기 전용으로 참조하고, 새 패키지(`weather`, `recommendation`)만 추가하므로 파일 충돌 가능성은 낮습니다. 그래도 브랜치를 나눠서 작업하고, 각자 끝나면 main으로 병합(PR 또는 fast-forward merge)하는 사람이 직접 확인 후 진행해주세요. Phase 5 쪽이 나중에 Phase 4의 실제 WeatherSnapshot을 연결해야 하니, Phase 4가 먼저 병합되면 Phase 5 담당자가 그 위에서 mock 부분을 실제 호출로 교체하면 됩니다.
