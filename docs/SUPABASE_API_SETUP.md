# 📡 Supabase API 설정 가이드 (Kotlin용)

이 가이드는 Supabase에서 API URL과 키를 찾아서 Kotlin 앱에서 사용하는 방법을 설명합니다.

## 🔍 1단계: Supabase 프로젝트 정보 확인

### Supabase 대시보드 접속
1. [supabase.com](https://supabase.com) 접속
2. 로그인 후 프로젝트 선택
3. 왼쪽 메뉴에서 `Settings` > `API` 클릭

### 필요한 정보 복사
다음 두 가지 정보가 필요합니다:

#### 1) Project URL
```
https://your-project-id.supabase.co
```

#### 2) API Key (anon/public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5...
```

## 🚀 2단계: Remote Config API URL 구성

### 기본 구조
```
https://your-domain.vercel.app/api/config/YOUR_APP_ID
```

### 예시
우리가 만든 간단한 테스트 앱의 경우:
```
http://localhost:3000/api/config/com.test.simple
```

## 📱 3단계: Kotlin에서 API 사용

### build.gradle.kts (Module: app)
```kotlin
android {
    compileSdk 34

    defaultConfig {
        applicationId "com.test.simple"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        // BuildConfig에 API URL 추가
        buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3000\"")
        buildConfigField("String", "APP_ID", "\"com.test.simple\"")
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
```

### ApiConstants.kt
```kotlin
object ApiConstants {
    // 개발 환경 (로컬 서버)
    const val BASE_URL_LOCAL = "http://10.0.2.2:3000/"  // 에뮬레이터용
    const val BASE_URL_LOCAL_DEVICE = "http://192.168.0.6:3000/"  // 실제 기기용
    
    // 프로덕션 환경 (배포된 서버)
    const val BASE_URL_PROD = "https://your-domain.vercel.app/"
    
    // 현재 사용할 URL (개발/프로덕션 전환)
    const val BASE_URL = BASE_URL_LOCAL  // 개발 시
    // const val BASE_URL = BASE_URL_PROD  // 배포 시
    
    // 테스트용 앱 ID
    const val TEST_APP_ID = "com.test.simple"
}
```

### RemoteConfigApi.kt
```kotlin
import retrofit2.http.GET
import retrofit2.http.Path

interface RemoteConfigApi {
    @GET("api/config/{appId}")
    suspend fun getConfig(@Path("appId") appId: String): RemoteConfigResponse
    
    companion object {
        const val ENDPOINT = "api/config/{appId}"
    }
}
```

### ApiClient.kt
```kotlin
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(ApiConstants.BASE_URL)
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val remoteConfigApi: RemoteConfigApi = retrofit.create(RemoteConfigApi::class.java)
}
```

### RemoteConfigRepository.kt
```kotlin
import android.util.Log

class RemoteConfigRepository {
    
    private val api = ApiClient.remoteConfigApi
    
    suspend fun getConfig(appId: String = ApiConstants.TEST_APP_ID): SimpleAppConfig? {
        return try {
            Log.d("API", "Requesting config for app: $appId")
            Log.d("API", "URL: ${ApiConstants.BASE_URL}api/config/$appId")
            
            val response = api.getConfig(appId)
            
            if (response.success) {
                Log.d("API", "Config loaded successfully")
                response.data
            } else {
                Log.e("API", "Config loading failed: ${response.error}")
                null
            }
        } catch (e: Exception) {
            Log.e("API", "Network error: ${e.message}", e)
            null
        }
    }
}
```

## 🔧 4단계: 네트워크 권한 및 보안 설정

### AndroidManifest.xml
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 인터넷 권한 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:name=".MyApplication"
        android:allowBackup="true"
        android:usesCleartextTraffic="true"  <!-- 개발 시 HTTP 허용 -->
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
    </application>
</manifest>
```

### network_security_config.xml (res/xml/)
개발 시 HTTP 통신을 위해 필요:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>  <!-- 에뮬레이터 -->
        <domain includeSubdomains="true">192.168.0.6</domain>  <!-- 로컬 네트워크 -->
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

AndroidManifest.xml의 application 태그에 추가:
```xml
android:networkSecurityConfig="@xml/network_security_config"
```

## 🧪 5단계: 연결 테스트

### MainActivity에서 테스트
```kotlin
class MainActivity : AppCompatActivity() {
    
    private val repository = RemoteConfigRepository()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 연결 테스트
        testConnection()
    }
    
    private fun testConnection() {
        lifecycleScope.launch {
            try {
                Log.d("TEST", "Testing API connection...")
                val config = repository.getConfig()
                
                if (config != null) {
                    Log.d("TEST", "✅ API 연결 성공!")
                    Log.d("TEST", "앱 이름: ${config.app.app_name}")
                    Log.d("TEST", "메뉴 개수: ${config.menus.size}")
                    Log.d("TEST", "스타일 개수: ${config.styles.size}")
                } else {
                    Log.e("TEST", "❌ API 연결 실패")
                }
            } catch (e: Exception) {
                Log.e("TEST", "❌ 연결 오류: ${e.message}", e)
            }
        }
    }
}
```

## 🌐 6단계: IP 주소 확인 방법

### 개발 서버 IP 찾기
터미널에서 Next.js 서버 실행 시 표시되는 정보 확인:
```bash
npm run dev

# 출력 예시:
# - Local:        http://localhost:3000
# - Network:      http://192.168.0.6:3000  <- 이 IP 사용
```

### Android에서 사용할 주소
- **에뮬레이터**: `http://10.0.2.2:3000`
- **실제 기기**: `http://192.168.0.6:3000` (위에서 확인한 Network IP)

## 🔍 7단계: 디버깅 팁

### Logcat으로 API 호출 확인
```kotlin
// Repository에서 로그 추가
Log.d("API_DEBUG", "Request URL: ${ApiConstants.BASE_URL}api/config/$appId")
Log.d("API_DEBUG", "Response: $response")
```

### 브라우저에서 직접 테스트
브라우저에서 다음 URL 접속하여 JSON 응답 확인:
```
http://localhost:3000/api/config/com.test.simple
```

### curl로 터미널에서 테스트
```bash
curl http://localhost:3000/api/config/com.test.simple
```

## ⚠️ 주의사항

1. **개발 vs 프로덕션**: `ApiConstants.BASE_URL` 값을 환경에 맞게 변경
2. **방화벽**: 로컬 개발 시 방화벽이 3000 포트를 차단하지 않도록 설정
3. **네트워크**: 실제 기기 테스트 시 컴퓨터와 같은 Wi-Fi 네트워크 사용
4. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용

## 🎯 완성된 예시

모든 설정이 완료되면 다음과 같이 간단하게 사용 가능:

```kotlin
// ViewModel에서
viewModelScope.launch {
    val config = repository.getConfig("com.test.simple")
    config?.let {
        // UI 업데이트
        _appConfig.value = it
    }
}
```

이제 Kotlin 앱에서 Remote Config API를 완벽하게 사용할 수 있습니다! 🚀 