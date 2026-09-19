# 반짝반짝 직업 탐험대 ⭐ (Sparkle Job Expedition)

> **특수교육(기본교육과정) 고등학생을 위한 활동 중심 진로·직업 체험 및 실시간 모니터링 웹앱 (SPA)**

![반짝반짝 직업 탐험대](https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80)

---

## 1. 프로젝트 개요 및 교육적 목적

특수교육(기본교육과정) 고등학교 학생들은 복잡한 텍스트 읽기와 추상적인 개념 이해에 어려움을 겪는 경우가 많습니다.  
**"반짝반짝 직업 탐험대"**는 텍스트 중심의 학습 방식을 지양하고, **시각적 그림 카드**, **실제 행동 중심의 사진 촬영**, **음성 소통 롤플레잉**, 그리고 **즉각적인 시청각적 보상(Web Audio API 차임벨, 음성 칭찬, 황금 별 스탬프, 축하 폭죽)**을 통해 학생들이 즐겁게 직무를 익힐 수 있도록 설계된 웹 애플리케이션입니다.

교사는 복잡한 로그인 절차 없이 4자리 PIN 번호(`1234`)로 **실시간 교사 대시보드**에 접속하여, 학생들이 미션을 완수할 때마다 실시간으로 학생 캐릭터 카드에 켜지는 황금 별과 제출된 사진을 모니터링하고 **"다 함께 칭찬하기"** 버튼으로 전체 학생들에게 축하 폭죽과 격려 메시지를 즉시 전송할 수 있습니다.

---

## 2. 핵심 주요 기능

### 1) 간편한 캐릭터 닉네임 선택 (학생 개인정보 완전 보호)
- 성명, 학번, 연락처 등 민감한 개인정보를 일절 입력받지 않습니다.
- '씩씩한 토끼 🐰', '다정한 곰돌이 🐻', '용감한 사자 🦁' 등 8가지 친근한 동물 캐릭터 버튼을 한 번 탭하는 것만으로 간편하게 참여합니다.

### 2) 바리스타 미션 (Google Gemini 멀티모달 시각 분석)
- **미션 내용**: 카페 음료 서빙 준비 실습 (컵, 뚜껑, 빨대, 냅킨, 트레이 세팅).
- **카메라 촬영 및 업로드**: 기기의 카메라로 세팅 사진을 촬영하거나 갤러리에서 업로드합니다.
- **배려 기능**: 카메라 장치가 없는 PC 환경을 위해 원클릭 **"샘플 바리스타 사진으로 체험하기"** 버튼을 기본 지원합니다.
- **Gemini AI 피드백**: 초등학교 1학년 수준의 쉽고 다정한 1~2문장 맞춤 칭찬(`"우와! 컵과 냅킨을 아주 잘 챙겼어요! 최고예요! ⭐"`)을 제공하고, 브라우저 음성 합성(TTS)으로 친절하게 읽어줍니다.

### 3) 마트 인사 미션 (브라우저 Web Speech API 음성 인식)
- **미션 내용**: 화면 속 친절한 마트 점장님 캐릭터에게 큰 소리로 "안녕하세요!" 인사하기.
- **유연한 정답 판별**: 발음이 명확하지 않아도 '안녕', '반갑', '어서' 등 긍정적 인사 키워드가 감지되면 즉각 성공 처리합니다.
- **무장애 대체 경로**: 마이크 사용이 어려운 환경이나 발화가 어려운 학생을 위해 큰 터치 버튼 클릭만으로도 인사 건네기가 가능합니다.
- **점장님 화답**: 점장님 캐릭터가 애니메이션과 함께 음성(TTS)으로 반갑게 화답합니다.

### 4) 실시간 교사 대시보드 (Firebase Cloud Firestore / 로컬 실시간 브로드캐스트)
- **간편 PIN 입장**: 4자리 PIN (`1234`)으로 즉시 로그인.
- **실시간 별 현황판**: 학생별 모은 별 개수, 최근 완료 미션, 촬영 사진 썸네일을 실시간(`onSnapshot`)으로 동기화.
- **원클릭 "다 함께 칭찬하기"**: 클릭 한 번으로 모든 학생 화면에 황금 메달 알림과 축하 컨페티(폭죽) 애니메이션 발송.
- **오프라인/데모 폴백 지원**: Firebase 설정값이 없어도 `BroadcastChannel`과 로컬 스토리지 기반으로 같은 네트워크/브라우저 내에서 100% 실시간 연동 테스트 가능.

---

## 3. 기술 스택

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, canvas-confetti
- **Audio & Speech**: Web Audio API (합성 차임벨 & 팡파르), Web Speech API (SpeechSynthesis TTS & SpeechRecognition STT)
- **Backend / Server**: Express 4, Node.js (`/api/gemini/analyze-barista` 엔드포인트)
- **Multimodal AI**: Google Gemini API (`@google/genai` SDK - `gemini-3.8-flash`)
- **Database & Sync**: Firebase Cloud Firestore (실시간 스냅샷 리스너 `onSnapshot`)

---

## 4. Firebase 프로젝트 생성 및 Cloud Firestore 설정 가이드

실제 클라우드 데이터베이스로 여러 기기 간에 영구적인 실시간 동기화를 사용하려면 다음 단계를 진행합니다.

1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속하여 **새 프로젝트 추가**를 클릭합니다.
2. 프로젝트 이름을 입력하고 생성합니다 (Google Analytics는 선택 사항).
3. 왼쪽 메뉴에서 **빌드 > Firestore Database**를 선택하고 **데이터베이스 만들기**를 클릭합니다.
4. 위치(Region)를 `asia-northeast3 (서울)` 등으로 선택합니다.
5. **프로젝트 설정 (톱니바퀴 아이콘) > 일반**으로 이동하여 **내 앱 > 웹 (</>)** 아이콘을 클릭해 웹 앱을 등록합니다.
6. 발급된 `firebaseConfig` 객체의 값들을 확인합니다.

---

## 5. Cloud Firestore 보안 규칙 (Security Rules)

학생들의 익명성을 보장하고 데이터 위변조를 방지하기 위해 Firebase 콘솔의 **Firestore Database > 규칙(Rules)** 탭에 아래 보안 규칙을 적용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. missions 컬렉션: 누구나 완료 기록 작성 및 실시간 조회 가능
    // 학생 식별자는 동물 캐릭터 닉네임만 저장되며, 수정/삭제는 제한됩니다.
    match /missions/{missionId} {
      allow read, create: if true;
      allow update, delete: if false;
    }
    
    // 2. broadcasts 컬렉션: 교사 칭찬 메시지 브로드캐스트
    match /broadcasts/{broadcastId} {
      allow read, create: if true;
      allow update, delete: if false;
    }
  }
}
```

---

## 6. Vercel 배포 가이드 및 환경 변수 설정

### 1) Vercel 배포 절차
1. 본 레포지토리를 GitHub에 Push합니다.
2. [Vercel](https://vercel.com/)에 로그인한 뒤 **Add New... > Project**를 누르고 해당 GitHub 레포지토리를 임포트합니다.
3. **Framework Preset**: `Vite` 선택
4. **Environment Variables** 탭에서 아래 환경 변수들을 입력합니다.
5. **Deploy** 버튼을 클릭하면 배포가 완료됩니다!

### 2) 환경 변수 (.env) 설정 목록

| 환경 변수명 | 필수 여부 | 설명 | 예시 |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | 필수 (서버) | Google Gemini AI 분석용 API 키 | `AIzaSy...` |
| `VITE_FIREBASE_API_KEY` | 선택 (클라이언트) | Firebase 웹 API 키 | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | 선택 (클라이언트) | Firebase Auth 도메인 | `sparkle-job.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | 선택 (클라이언트) | Firebase 프로젝트 ID | `sparkle-job` |
| `VITE_FIREBASE_STORAGE_BUCKET` | 선택 (클라이언트) | Firebase Storage 버킷 | `sparkle-job.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 선택 (클라이언트) | Firebase 발신자 ID | `1234567890` |
| `VITE_FIREBASE_APP_ID` | 선택 (클라이언트) | Firebase 웹 앱 ID | `1:123456:web:abcd` |

> 💡 **참고**: Firebase 환경 변수를 입력하지 않더라도, 웹앱 자체에 내장된 고성능 **로컬 실시간 모의(Mock) 동기화 엔진**이 자동 작동하여 기능 시연 및 단일 교실 테스트가 완벽하게 동작합니다.

---

## 7. 로컬 개발 환경 실행 방법

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 실행 (Port 3000)
npm run dev

# 3. 브라우저에서 열기
# http://localhost:3000
```

---

## 8. 접근성 및 특수교육 UI/UX 고려사항

- **최소 터치 크기 보장**: 모든 핵심 버튼 및 캐릭터 선택 영역은 최소 높이 `h-16`(64px) 이상으로 설계되어 마우스 조작이 미숙하거나 손떨림이 있는 학생도 손쉽게 탭할 수 있습니다.
- **인지 부하 최소화**: 장황한 텍스트 설명 대신 직관적인 이모지와 큰 아이콘(🥤, 🥢, 🧻, ☕, 🏪)을 전면에 배치하였습니다.
- **다중 감각 피드백**: 시각(화면 변화, 골드 스타, 폭죽), 청각(Web Audio 차임벨, 다정한 한국어 음성 안내)을 동시에 제공하여 성취감을 극대화합니다.
- **교사-학생 상호작용 강화**: 교사가 학생 개개인의 노력을 실시간으로 확인하고 버튼 하나로 즉각 칭찬을 전달할 수 있어 교실 내 긍정적 행동 지원(PBS)에 적합합니다.
