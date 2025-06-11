# Remote Config API 문서

이 문서는 모바일 앱 개발자들이 Remote Config 시스템과 연동하기 위한 API 사용법을 설명합니다.

## 기본 정보

- **Base URL**: `https://your-domain.vercel.app`
- **Content-Type**: `application/json`
- **응답 형식**: JSON

## 공통 응답 형식

모든 API는 다음과 같은 공통 응답 형식을 사용합니다:

```json
{
  "success": boolean,
  "data": any,           // 성공 시 데이터
  "error": string,       // 실패 시 에러 메시지
  "message": string      // 추가 메시지 (선택사항)
}
```

## 1. Remote Config 조회 (모바일 앱용)

### GET /api/config/{appId}

특정 앱의 전체 설정을 조회합니다. 모바일 앱이 시작될 때 이 API를 호출하여 최신 설정을 가져옵니다.

#### 파라미터
- `appId` (path): 앱 식별자 (예: com.example.myapp)

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "app": {
      "id": "uuid",
      "app_name": "My Awesome App",
      "app_id": "com.example.myapp",
      "package_name": "com.example.myapp",
      "version": "1.0.0",
      "description": "앱 설명",
      "status": "active"
    },
    "menus": [
      {
        "id": "uuid",
        "menu_id": "home",
        "title": "홈",
        "icon": "home",
        "order_index": 0,
        "parent_id": null,
        "menu_type": "item",
        "action_type": "navigate",
        "action_value": "/home",
        "is_visible": true,
        "is_enabled": true
      }
    ],
    "toolbars": [
      {
        "id": "uuid",
        "toolbar_id": "main_toolbar",
        "title": "메인 툴바",
        "position": "top",
        "background_color": "#FFFFFF",
        "text_color": "#000000",
        "height": 56,
        "is_visible": true,
        "buttons": []
      }
    ],
    "fcm_topics": [
      {
        "id": "uuid",
        "topic_name": "공지사항",
        "topic_id": "announcements",
        "description": "앱 공지사항",
        "is_default": true,
        "is_active": true
      }
    ],
    "styles": [
      {
        "id": "uuid",
        "style_key": "primary_color",
        "style_value": "#007AFF",
        "style_category": "color",
        "description": "메인 색상"
      }
    ]
  }
}
```

#### 오류 응답

```json
{
  "success": false,
  "error": "앱을 찾을 수 없습니다."
}
```

## 2. 앱 관리 API (대시보드용)

### GET /api/apps

모든 앱 목록을 조회합니다.

#### 응답 예시
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "app_name": "My App",
      "app_id": "com.example.myapp",
      "package_name": "com.example.myapp",
      "version": "1.0.0",
      "description": "앱 설명",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/apps

새 앱을 생성합니다.

#### 요청 본문
```json
{
  "app_name": "My App",
  "app_id": "com.example.myapp",
  "package_name": "com.example.myapp",
  "version": "1.0.0",
  "description": "앱 설명",
  "status": "active"
}
```

### GET /api/apps/{id}

특정 앱의 상세 정보를 조회합니다.

### PUT /api/apps/{id}

특정 앱의 정보를 수정합니다.

### DELETE /api/apps/{id}

특정 앱을 삭제합니다.

## 3. 메뉴 관리 API

### GET /api/apps/{id}/menus

특정 앱의 메뉴 목록을 조회합니다.

### POST /api/apps/{id}/menus

특정 앱에 새 메뉴를 추가합니다.

#### 요청 본문
```json
{
  "menu_id": "home",
  "title": "홈",
  "icon": "home",
  "order_index": 0,
  "parent_id": null,
  "menu_type": "item",
  "action_type": "navigate",
  "action_value": "/home",
  "is_visible": true,
  "is_enabled": true
}
```

## 4. 모바일 앱 연동 가이드

### Android (Kotlin) 예시

```kotlin
class RemoteConfigService {
    private val baseUrl = "https://your-domain.vercel.app"
    private val retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    private val api = retrofit.create(RemoteConfigApi::class.java)
    
    suspend fun getConfig(appId: String): RemoteConfigResponse? {
        return try {
            val response = api.getConfig(appId)
            if (response.success) {
                response.data
            } else {
                Log.e("RemoteConfig", "Error: ${response.error}")
                null
            }
        } catch (e: Exception) {
            Log.e("RemoteConfig", "Network error", e)
            null
        }
    }
}

interface RemoteConfigApi {
    @GET("api/config/{appId}")
    suspend fun getConfig(@Path("appId") appId: String): ApiResponse<RemoteConfigData>
}

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: String?
)

data class RemoteConfigData(
    val app: AppInfo,
    val menus: List<MenuItem>,
    val toolbars: List<Toolbar>,
    val fcm_topics: List<FcmTopic>,
    val styles: List<Style>
)
```

### iOS (Swift) 예시

```swift
class RemoteConfigService {
    private let baseURL = "https://your-domain.vercel.app"
    
    func getConfig(appId: String) async throws -> RemoteConfigData? {
        guard let url = URL(string: "\(baseURL)/api/config/\(appId)") else {
            throw RemoteConfigError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(ApiResponse<RemoteConfigData>.self, from: data)
        
        if response.success {
            return response.data
        } else {
            throw RemoteConfigError.apiError(response.error ?? "Unknown error")
        }
    }
}

struct ApiResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: String?
}

struct RemoteConfigData: Codable {
    let app: AppInfo
    let menus: [MenuItem]
    let toolbars: [Toolbar]
    let fcm_topics: [FcmTopic]
    let styles: [Style]
}
```

## 5. 에러 코드

| HTTP 코드 | 설명 |
|-----------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

## 6. 사용 예시

### 앱 시작 시 설정 로드

```kotlin
// Android
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            val config = RemoteConfigService().getConfig("com.example.myapp")
            config?.let { 
                applyConfig(it)
            }
        }
    }
    
    private fun applyConfig(config: RemoteConfigData) {
        // 메뉴 구성
        setupMenu(config.menus)
        
        // 스타일 적용
        applyStyles(config.styles)
        
        // FCM 토픽 구독
        subscribeFcmTopics(config.fcm_topics)
    }
}
```

```swift
// iOS
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        Task {
            do {
                let config = try await RemoteConfigService().getConfig(appId: "com.example.myapp")
                await MainActor.run {
                    applyConfig(config)
                }
            } catch {
                print("Failed to load config: \(error)")
            }
        }
        
        return true
    }
    
    func applyConfig(_ config: RemoteConfigData?) {
        guard let config = config else { return }
        
        // 메뉴 구성
        setupMenu(config.menus)
        
        // 스타일 적용
        applyStyles(config.styles)
        
        // FCM 토픽 구독
        subscribeFcmTopics(config.fcm_topics)
    }
}
```

## 7. 캐싱 권장사항

- 앱 시작 시 설정을 로드하고 로컬에 캐시
- 백그라운드에서 주기적으로 설정 업데이트 확인
- 네트워크 오류 시 캐시된 설정 사용
- 설정 변경 시 앱 재시작 없이 동적 적용

## 8. 보안 고려사항

- HTTPS 사용 권장
- API 키나 인증 토큰 필요 시 헤더에 포함
- 민감한 정보는 설정에 포함하지 않음
- 클라이언트 측에서 설정 유효성 검증

이 API를 사용하여 모바일 앱에서 동적으로 설정을 관리할 수 있습니다. 추가 질문이나 지원이 필요하시면 개발팀에 문의해주세요. 