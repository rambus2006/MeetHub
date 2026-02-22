# MeetHub - 당신의 회의 메이트

LiveKit 기반 실시간 회의를 Deepgram STT와 OpenAI 요약 모델로 자동 기록하고, Spring Boot와 React를 활용하여 회의록을 체계적으로 보관 · 공유할 수 있게 설계된 협업 플랫폼입니다.

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [핵심 기능](#핵심-기능)
- [시스템 아키텍처](#시스템-아키텍처)
- [디렉터리 가이드](#디렉터리-가이드)
- [기술 스택](#기술-스택)
- [선행 요구 사항](#선행-요구-사항)
- [환경 변수 템플릿](#환경-변수-템플릿)
- [로컬 실행 절차](#로컬-실행-절차)
- [Docker 배포](#docker-배포)
- [운영 체크리스트](#운영-체크리스트)
- [테스트와 품질 확인](#테스트와-품질-확인)

## 프로젝트 개요

- 호스트가 방을 만들면 LiveKit Room/Token이 생성되고, React SPA에서 튜토리얼·레이아웃 편집·자막·요약 스트림·녹화 제어·채팅·참가자 제어를 모두 처리합니다.
- Python LiveKit Agent는 Deepgram STT와 OpenAI LLM을 이용해 실시간 캡션, 5분 단위 요약, 최종 요약, HLS 녹화, 스크립트 추출을 수행하고 Spring Boot API에 보고서를 업로드합니다.
- 백엔드는 사용자/폴더/회의록/권한을 MySQL과 Redis로 관리하고, JWT 인증·이메일 인증·공유 알림 메일·Swagger·Actuator·Prometheus 지표를 제공합니다.

## 핵심 기능

### 1. 실시간 회의

- LiveKit 토큰으로 호스트/참가자를 구분하고, StageLayout·Host/Participant ControlBar·Sidebar·Chat·Participants Panel 등 커스텀 UI를 제공합니다.
- UI 튜토리얼(역할별 Step), 레이아웃 편집/프리뷰, 화면 공유, 녹음/녹화 제어, RoomAudioFilter, Toast/Overlay 피드백까지 React 19 + Zustand로 상태 관리를 수행합니다.
- CaptionsOverlay와 SummaryStreamBridge로 데이터 채널에 올라온 실시간 자막·5분 요약을 즉시 노출합니다.

### 2. AI 회의록 생성

- MeetingManager가 방 생성 시 LiveKit Agent Dispatch API를 호출해 Python Worker를 자동 투입합니다.
- Agent는 Deepgram STT를 구독하여 화자 버퍼에 누적하고, 5분마다 LLM으로 주제 요약을 생성하며, 회의 종료 시 모든 스크립트/요약/재생 목록을 S3에 기록합니다.
- HLS 세그먼트와 playlist.m3u8을 생성한 뒤 Spring Boot `/reports` API에 요약, 스크립트, 재생 길이를 업로드하여 Report 엔티티를 완성합니다.

### 3. 폴더 기반 문서/권한 관리

- 사용자별 루트 폴더를 자동 생성하고, 최대 7단계의 중첩 폴더를 트리 형태로 노출합니다.
- 폴더/파일 이름 변경, 폴더/파일 이동, 대량 삭제, 공유 권한 상속(OWNER/EDITOR/VIEWER), 중복 권한 방지 로직을 제공합니다.
- 공유받은 폴더·파일은 별도 페이지에서 계층 구조를 보며 접근할 수 있습니다.

### 4. 회의록 공유

- Report 상세 화면에서 요약, 키워드, 녹화 영상(HLS), 페이징 스크립트, 댓글/해결 여부, 공유 권한 탭을 제공합니다.
- 이메일 기반 공유 초대, 권한 변경/삭제, 공유자 목록 조회, 공유 알림 메일 발송이 지원됩니다.
- 댓글은 스크립트 단위로 달 수 있고, 해결 상태를 토글하여 TODO 트래킹이 가능합니다.

### 5. 추가 사항

- JWT Access/Refresh, 블랙리스트, 토큰 재발급 대기열, Redis 기반 이메일 인증, Gmail SMTP 발송, 비밀번호 변경을 제공합니다.
- LiveKit 방 생성 쿨다운, Room 강제 종료, Report/Folder 권한 체크용 Security SpEL, CORS 화이트리스트, Swagger 보안 설정을 포함합니다.
- Spring Actuator + Prometheus 지표, Datadog RUM, 애플리케이션 로그 파일, Redis/DB 헬스체크로 운영 상태를 모니터링할 수 있습니다.

## 시스템 아키텍처

- React SPA가 Nginx 경유로 Spring Boot API(`/api/**`)를 호출하고, 인증 토큰/리포트 데이터를 주고받습니다.
- Spring Boot는 MySQL과 Redis로 상태를 관리하며, LiveKit Room & Agent Dispatch, 이메일, AWS S3, Python Agent와 연동합니다.
- LiveKit Agent는 LiveKit Room에 Participant로 접속하여 오디오를 수집/믹싱하고, S3 · OpenAI · Deepgram · Spring으로로 데이터를 전송합니다.
- docker-compose는 `backend` + `nginx` + `certbot`를 묶어 배포하며, 외부 Docker 네트워크(Jenkins/Portainer/Monitoring)에 프록시를 연결할 수 있습니다.

```
사용자 브라우저 (React SPA)
          │
          ▼
      Nginx (80/443)
          │
Spring Boot API (8088) ── MySQL
          │              └─> Report/File 데이터
          ├──────────────> Redis (방 정보, 인증, 토큰)
          ├──────────────> Gmail SMTP / Email Template
          └──────────────> LiveKit Server API
                                   │
                                   ▼
                         LiveKit Agent (Python)
                             │      │
                             │      ├─ Deepgram STT
                             │      └─ OpenAI LLM
                             └─ AWS S3 (HLS 레코딩)
```

## 디렉터리 가이드

```
.
├─ backend/          # Spring Boot 3.5 프로젝트 (Java 21, Gradle)
├─ frontend/         # React 19 + TypeScript + Vite SPA
├─ livekit_agent/    # Python LiveKit Worker (STT, 요약, 녹화)
├─ nginx/            # Reverse proxy 및 TLS 설정
├─ docker-compose.yml# backend + nginx + certbot 배포 정의
└─ README.md
```

주요 서브 모듈

- `backend/src/main/java/com/ssafy/meethub/auth|meeting|report|user|common`: 인증, 회의, 보고서, 파일시스템, 공통 모듈
- `backend/src/main/resources/templates/email`: 공유/인증 메일 템플릿(Thymeleaf)
- `frontend/src/api|components|hooks|pages|store|types`: Axios API 모듈, 페이지별 컴포넌트, 커스텀 훅, Zustand 스토어, 타입 정의
- `livekit_agent/agent.py|models.py|database.py`: MeetingAgent 구현, SQLite 모델, 비동기 DB 큐
- `nginx/Dockerfile`: certbot와 연동되는 리버스 프록시 이미지 정의

## 기술 스택

| 영역        | 주요 기술                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프론트엔드  | React 19, TypeScript, Vite 7, Tailwind CSS, @livekit/components, Zustand, React Router v7, Swiper, Datadog RUM                                                    |
| 백엔드      | Spring Boot 3.5, Java 21, Spring Security, Spring Data JPA, Redis, MySQL, JWT, LiveKit Server SDK, Retrofit/OkHttp, Micrometer, Springdoc Swagger, Thymeleaf Mail |
| AI/에이전트 | Python 3.10, livekit-agents, livekit-plugins-deepgram, livekit-plugins-openai, Deepgram STT, OpenAI API, httpx, boto3, aiosqlite                                  |
| 인프라/배포 | Docker, docker-compose, Nginx, Certbot, AWS S3, LiveKit Cloud/Server, Prometheus, Gmail SMTP                                                                      |

## 선행 요구 사항

- Java 21 및 Gradle Wrapper(프로젝트 동봉)
- Node.js 20+ / npm 10+
- Python 3.10
- MySQL 8.0
- Redis 7.x
- LiveKit 서버(Cloud 또는 자가 호스팅)와 API Key/Secret

## 로컬 실행 절차

1. **저장소 준비**

   - `git clone` 후 `S13P31S103` 디렉터리로 이동합니다.
   - MySQL에 빈 데이터베이스를 만들고 `.env`에 입력합니다.
   - Redis와 LiveKit 서버, AWS S3 버킷이 접근 가능한지 확인합니다.

2. **백엔드**

   ```
   cd backend
   ./gradlew clean bootRun
   ```

   - 서버는 `http://localhost:8088/api`에서 동작하며 Swagger UI는 `/api/docs`입니다.

3. **프론트엔드**

   ```
   cd frontend
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

   - `.env`의 `VITE_SERVER_URL`을 백엔드 주소로 맞춘 뒤 브라우저에서 `http://localhost:5173` 접속합니다.

4. **LiveKit Agent**

   ```
   cd livekit_agent
   python -m venv .venv
   source .venv/bin/activate  # Windows는 .venv\Scripts\activate
   pip install -r requirement.txt
   python main.py dev
   ```

   - LiveKit Agent Worker가 실행 중이어야 회의 생성 시 자동으로 참여합니다.

5. **(선택) Docker로 백엔드 실행**
   ```
   docker compose up -d backend
   ```
   - 로컬 개발 시 nginx/certbot은 필요하지 않습니다.

## 운영 체크리스트

- `GET /api/docs` : Springdoc Swagger (JWT 인증 필요 시 Authorization 헤더 설정)
- `GET /api/actuator/health`, `/api/actuator/info`, `/api/actuator/prometheus` : 헬스/지표 확인
- 애플리케이션 로그 : 컨테이너 기준 `/app/logs/application.log`
- 이메일 : Gmail SMTP 사용, 2단계 인증 + 앱 패스워드 필수
- Datadog RUM : 프론트 빌드 결과에 `VITE_DD_*` 값이 주입되어야 세션이 수집됩니다.
- S3 : `video-recording/{roomId}` 경로로 세그먼트/playlist가 업로드되는지 확인합니다.
- LiveKit Agent : `monitor.sh`, `deploy.sh` 스크립트를 활용해 Worker 재시작/배포를 자동화할 수 있습니다.

## 테스트와 품질 확인

- 백엔드 단위/통합 테스트
  ```
  cd backend
  ./gradlew test
  ./gradlew checkstyleMain checkstyleTest
  ```
- 프론트엔드 정적 검사
  ```
  cd frontend
  npm run lint
  npm run build
  ```
- 에이전트(선택)
  - `python -m compileall .` 로 문법 오류를 확인하거나 `ruff`, `mypy` 등 사내 기준에 맞춘 툴을 추가할 수 있습니다.
- Pull Request 전 체크리스트
  - Swagger에서 주요 API 동작 확인
  - 회의 생성 → 에이전트 자동 투입 → 회의 종료 후 리포트 생성까지 통합 시나리오 점검
  - 공유/권한 변경, 이메일 발송, Datadog RUM 세션, Actuator 지표를 최소 1회 확인
