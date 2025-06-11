# Remote Config Dashboard

Next.js 15 + Supabase를 활용한 모바일 앱 Remote Config 관리 시스템입니다.

## 🚀 주요 기능

- **앱 관리**: 모바일 앱 등록 및 관리 (CRUD)
- **메뉴 관리**: 동적 메뉴 구조 설정 (계층형 메뉴, CRUD)
- **툴바 관리**: 앱 툴바 설정 및 커스터마이징 (동적 버튼, CRUD)
- **FCM 토픽 관리**: 푸시 알림 토픽 관리 (기본/선택 토픽, CRUD)
- **스타일 관리**: 앱 디자인 테마 설정 (색상/타이포그래피/간격, CRUD)
- **샘플 데이터**: 쇼핑몰 앱 예시 데이터 자동 생성
- **API 엔드포인트**: 모바일 앱 연동을 위한 RESTful API
- **Kotlin 가이드**: Android 개발자를 위한 상세한 통합 가이드

## 🛠 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- Supabase 계정

## 🔧 설치 및 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd remote-config-supabase
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. 데이터베이스 설정

Supabase SQL 에디터에서 `supabase/schema.sql` 파일의 내용을 실행하여 테이블을 생성하세요.

### 5. 샘플 데이터 생성 (선택사항)

```bash
npm run create-sample-data
```

쇼핑몰 앱 예시 데이터를 자동으로 생성합니다.

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 7. API 테스트

```bash
npm run test-api
```

생성된 샘플 데이터와 API가 제대로 작동하는지 확인합니다.

## 🗄️ 데이터베이스 스키마

### 테이블 구조

1. **app**: 앱 기본 정보
2. **menu**: 메뉴 구조 및 설정
3. **app_toolbar**: 툴바 설정
4. **app_fcm_topic**: FCM 토픽 관리
5. **app_style**: 스타일 설정

상세한 스키마는 `supabase/schema.sql` 파일을 참조하세요.

## 📚 API 문서

### 주요 엔드포인트

#### 앱 관리
- `GET /api/apps` - 앱 목록 조회
- `POST /api/apps` - 새 앱 생성
- `GET /api/apps/[id]` - 특정 앱 조회
- `PUT /api/apps/[id]` - 앱 정보 수정
- `DELETE /api/apps/[id]` - 앱 삭제

#### Remote Config (모바일 앱용)
- `GET /api/config/[appId]` - 앱 설정 전체 조회

#### 메뉴 관리
- `GET /api/apps/[id]/menus` - 메뉴 목록 조회
- `POST /api/apps/[id]/menus` - 새 메뉴 생성

#### 기타 관리 기능
- `GET /api/apps/[id]/toolbars` - 툴바 조회
- `GET /api/apps/[id]/fcm_topics` - FCM 토픽 조회
- `GET /api/apps/[id]/styles` - 스타일 조회

상세한 API 문서는 `docs/API_DOCUMENTATION.md`를 참조하세요.

## 📱 모바일 앱 연동

### Kotlin/Android 가이드

완전한 Android 통합 가이드는 `docs/KOTLIN_API_GUIDE.md`를 참조하세요.

주요 내용:
- Retrofit 설정 및 사용법
- 데이터 모델 정의
- 동적 메뉴/툴바 구성
- 스타일 적용 방법
- FCM 토픽 구독 관리
- 캐싱 전략
- 모범 사례

### 샘플 앱 데이터

현재 시스템에는 다음과 같은 샘플 데이터가 포함되어 있습니다:

**앱 정보**
- 이름: 쇼핑몰 앱
- 패키지: com.example.shopping
- Remote Config URL: `https://your-domain.vercel.app/api/config/com.example.shopping`

**메뉴 구조**
- 홈, 카테고리(패션, 전자제품, 도서), 장바구니, 주문내역, 내 정보, 고객지원

**툴바**
- 하단 툴바 (홈, 검색, 장바구니, 내 정보 버튼)

**FCM 토픽**
- 전체 알림(기본), 프로모션 알림, 주문 알림, 신상품 알림

**스타일**
- 16개 스타일 속성 (색상, 타이포그래피, 간격, 컴포넌트)

### Android (Kotlin) 예시

```kotlin
// Retrofit 설정
interface RemoteConfigApi {
    @GET("api/config/{appId}")
    suspend fun getConfig(@Path("appId") appId: String): ApiResponse<RemoteConfigData>
}

// 사용 예시
class RemoteConfigService {
    suspend fun loadConfig(appId: String) {
        val config = api.getConfig(appId)
        // 설정 적용
    }
}
```

### iOS (Swift) 예시

```swift
// URLSession 사용
class RemoteConfigService {
    func getConfig(appId: String) async throws -> RemoteConfigData? {
        let url = URL(string: "https://your-domain.vercel.app/api/config/\(appId)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(ApiResponse<RemoteConfigData>.self, from: data)
        return response.data
    }
}
```

## 🚀 배포

### Vercel 배포

1. Vercel 계정에 로그인
2. 저장소를 Vercel에 연결
3. 환경 변수 설정
4. 배포

```bash
npm run build  # 배포 전 빌드 테스트
```

## 🤝 기여하기

1. Fork 생성
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🆘 지원

문제가 발생하거나 질문이 있으시면 Issue를 생성하거나 개발팀에 문의하세요.

---

## 🔍 프로젝트 구조

```
src/
├── app/
│   ├── api/                 # API 라우트
│   │   ├── apps/           # 앱 관리 API
│   │   └── config/         # Remote Config API
│   ├── apps/[id]/          # 앱 관리 페이지
│   └── page.tsx            # 메인 대시보드
├── components/             # 재사용 컴포넌트
├── lib/                    # 유틸리티 및 설정
├── types/                  # TypeScript 타입 정의
└── ...
```

## 📋 사용 가능한 스크립트

```bash
npm run dev              # 개발 서버 시작
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 시작
npm run lint             # ESLint 코드 검사
npm run create-sample-data  # 샘플 데이터 생성
npm run test-api         # API 테스트 실행
```

## 🎯 핵심 특징

- **완전한 CRUD 기능**: 모든 리소스(앱, 메뉴, 툴바, FCM 토픽, 스타일)에 대한 생성, 조회, 수정, 삭제 기능
- **계층형 메뉴**: 상위-하위 메뉴 구조 지원
- **동적 툴바**: 버튼 추가/제거, 순서 변경, 액션 설정
- **FCM 통합**: 기본 토픽과 선택적 토픽 관리
- **스타일 시스템**: 카테고리별 스타일 관리 (색상, 타이포그래피, 간격, 컴포넌트)
- **모바일 친화적**: Android/iOS 앱에서 바로 사용 가능한 API 구조
- **실시간 업데이트**: 설정 변경 시 즉시 모바일 앱에 반영 가능

이 시스템을 통해 모바일 앱의 설정을 중앙에서 관리하고, 실시간으로 업데이트할 수 있습니다.
