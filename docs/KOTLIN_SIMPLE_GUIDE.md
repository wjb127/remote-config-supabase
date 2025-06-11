# 🚀 Kotlin Remote Config 초간단 테스트 가이드

이 가이드는 Kotlin Android 앱에서 Remote Config가 실제로 작동하는지 빠르게 확인할 수 있는 최소한의 예제입니다.

## 📱 간단한 샘플 데이터

### 앱 정보
- **앱 ID**: `com.test.simple`
- **Remote Config URL**: `http://localhost:3000/api/config/com.test.simple`

### 포함된 데이터
- **메뉴 2개**: 홈, 프로필
- **스타일 3개**: 메인 색상, 글자 크기, 버튼 둥글기

## 🔧 1단계: Android Studio 설정

### build.gradle.kts (Module: app)
```kotlin
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
}
```

### AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## 📊 2단계: 데이터 모델 (간단 버전)

```kotlin
// RemoteConfigModels.kt
data class SimpleConfigResponse(
    val success: Boolean,
    val data: SimpleAppConfig?,
    val error: String?
)

data class SimpleAppConfig(
    val app: SimpleApp,
    val menus: List<SimpleMenu>,
    val styles: List<SimpleStyle>
)

data class SimpleApp(
    val app_name: String,
    val app_id: String,
    val version: String
)

data class SimpleMenu(
    val menu_id: String,
    val title: String,
    val icon: String?,
    val action_value: String?
)

data class SimpleStyle(
    val style_key: String,
    val style_value: String,
    val style_category: String
)
```

## 🌐 3단계: API 인터페이스

```kotlin
// RemoteConfigApi.kt
import retrofit2.http.GET
import retrofit2.http.Path

interface RemoteConfigApi {
    @GET("api/config/{appId}")
    suspend fun getConfig(@Path("appId") appId: String): SimpleConfigResponse
}
```

## 🛠️ 4단계: Repository

```kotlin
// RemoteConfigRepository.kt
import android.util.Log
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class RemoteConfigRepository {
    private val api = Retrofit.Builder()
        .baseUrl("http://10.0.2.2:3000/") // Android 에뮬레이터용 localhost
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(RemoteConfigApi::class.java)
    
    suspend fun getConfig(): SimpleAppConfig? {
        return try {
            Log.d("API", "Requesting config for com.test.simple")
            val response = api.getConfig("com.test.simple")
            if (response.success) {
                Log.d("API", "✅ Config loaded successfully")
                response.data
            } else {
                Log.e("API", "❌ Config loading failed: ${response.error}")
                null
            }
        } catch (e: Exception) {
            Log.e("API", "❌ Network error: ${e.message}", e)
            null
        }
    }
}
```

> **📋 API 설정이 복잡하다면?** `docs/SUPABASE_API_SETUP.md` 문서를 참고하세요!

## 🎯 5단계: ViewModel

```kotlin
// MainActivity.kt (ViewModel 포함)
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class RemoteConfigViewModel : ViewModel() {
    private val repository = RemoteConfigRepository()
    
    private val _config = MutableStateFlow<SimpleAppConfig?>(null)
    val config: StateFlow<SimpleAppConfig?> = _config
    
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading
    
    fun loadConfig() {
        viewModelScope.launch {
            _loading.value = true
            val result = repository.getConfig()
            _config.value = result
            _loading.value = false
        }
    }
}
```

## 📱 6단계: MainActivity

```kotlin
// MainActivity.kt
import android.graphics.Color
import android.os.Bundle
import android.util.TypedValue
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    private val viewModel: RemoteConfigViewModel by viewModels()
    
    private lateinit var loadingBar: ProgressBar
    private lateinit var appTitle: TextView
    private lateinit var menuContainer: LinearLayout
    private lateinit var testButton: Button
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setupUI()
        observeViewModel()
        
        // Remote Config 로드
        viewModel.loadConfig()
    }
    
    private fun setupUI() {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }
        
        loadingBar = ProgressBar(this)
        
        appTitle = TextView(this).apply {
            text = "Remote Config 테스트"
            textSize = 20f
            setPadding(0, 0, 0, 32)
        }
        
        menuContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        
        testButton = Button(this).apply {
            text = "설정 다시 로드"
            setOnClickListener { viewModel.loadConfig() }
        }
        
        layout.addView(loadingBar)
        layout.addView(appTitle)
        layout.addView(menuContainer)
        layout.addView(testButton)
        
        setContentView(layout)
    }
    
    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.loading.collect { isLoading ->
                loadingBar.isVisible = isLoading
            }
        }
        
        lifecycleScope.launch {
            viewModel.config.collect { config ->
                config?.let { updateUI(it) }
            }
        }
    }
    
    private fun updateUI(config: SimpleAppConfig) {
        // 앱 제목 업데이트
        appTitle.text = "${config.app.app_name} (v${config.app.version})"
        
        // 메뉴 표시
        menuContainer.removeAllViews()
        config.menus.forEach { menu ->
            val menuButton = Button(this).apply {
                text = "${menu.icon} ${menu.title}"
                setOnClickListener {
                    // 메뉴 클릭 처리
                    println("메뉴 클릭: ${menu.title} -> ${menu.action_value}")
                }
            }
            menuContainer.addView(menuButton)
        }
        
        // 스타일 적용
        applyStyles(config.styles)
    }
    
    private fun applyStyles(styles: List<SimpleStyle>) {
        styles.forEach { style ->
            when (style.style_key) {
                "primary_color" -> {
                    // 메인 색상 적용
                    try {
                        val color = Color.parseColor(style.style_value)
                        testButton.setBackgroundColor(color)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
                "font_size" -> {
                    // 글자 크기 적용
                    try {
                        val size = style.style_value.replace("sp", "").toFloat()
                        appTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, size + 4)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
                "button_radius" -> {
                    // 버튼 둥글기는 XML drawable로 처리해야 함
                    println("버튼 둥글기: ${style.style_value}")
                }
            }
        }
    }
}
```

## 🚀 7단계: 테스트 실행

### 1. 간단한 샘플 데이터 생성
```bash
cd /path/to/remote-config-supabase
node scripts/create-simple-sample.js
```

### 2. 서버 실행
```bash
npm run dev
```

### 3. Android 앱 실행
- Android Studio에서 위 코드를 입력
- 앱 실행 시 자동으로 Remote Config 로드
- "설정 다시 로드" 버튼으로 다시 테스트

## 🔍 예상 결과

앱 실행 시 다음과 같이 표시됩니다:
- **앱 제목**: "테스트 앱 (v1.0.0)"
- **메뉴 버튼 2개**: "🏠 홈", "👤 프로필"
- **스타일 적용**: 파란색 버튼, 조정된 글자 크기

## 🛠️ 디버깅 팁

### 네트워크 연결 확인
```kotlin
// 에뮬레이터: http://10.0.2.2:3000
// 실제 기기: http://YOUR_COMPUTER_IP:3000
```

### 로그 확인
```kotlin
Log.d("RemoteConfig", "Config loaded: $config")
```

### API 응답 직접 테스트
브라우저에서 `http://localhost:3000/api/config/com.test.simple` 접속하여 JSON 응답 확인

## 🎉 성공!

앱에서 Remote Config 데이터가 표시되면 성공입니다! 이제 더 복잡한 기능들을 점진적으로 추가할 수 있습니다. 