# Kotlin Android 앱용 Remote Config API 가이드

이 가이드는 Android Kotlin 개발자가 Remote Config API를 사용하여 앱 설정을 동적으로 관리하는 방법을 설명합니다.

## 📋 목차

- [기본 설정](#기본-설정)
- [API 엔드포인트](#api-엔드포인트)
- [데이터 모델](#데이터-모델)
- [구현 예제](#구현-예제)
- [사용 사례](#사용-사례)
- [모범 사례](#모범-사례)

## 🔧 기본 설정

### 의존성 추가

`build.gradle.kts (Module: app)` 파일에 다음 의존성을 추가하세요:

```kotlin
dependencies {
    // Retrofit for HTTP requests
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    
    // OkHttp for logging (개발용)
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    
    // Gson for JSON parsing
    implementation("com.google.code.gson:gson:2.11.0")
}
```

### 권한 설정

`AndroidManifest.xml`에 인터넷 권한을 추가하세요:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 🌐 API 엔드포인트

### 기본 URL
```
https://your-domain.vercel.app/api
```

### 주요 엔드포인트

| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/config/{appId}` | 전체 앱 설정 조회 |
| GET | `/apps/{id}/menus` | 메뉴 목록 조회 |
| GET | `/apps/{id}/toolbars` | 툴바 목록 조회 |
| GET | `/apps/{id}/fcm_topics` | FCM 토픽 목록 조회 |
| GET | `/apps/{id}/styles` | 스타일 목록 조회 |

## 📊 데이터 모델

### 1. Remote Config Response

```kotlin
data class RemoteConfigResponse(
    val success: Boolean,
    val data: AppConfig?,
    val error: String?
)

data class AppConfig(
    val app: App,
    val menus: List<Menu>,
    val toolbars: List<Toolbar>,
    val fcmTopics: List<FcmTopic>,
    val styles: List<Style>
)
```

### 2. App

```kotlin
data class App(
    val id: String,
    @SerializedName("app_name")
    val appName: String,
    @SerializedName("app_id")
    val appId: String,
    @SerializedName("package_name")
    val packageName: String,
    val version: String,
    val description: String?,
    val status: String, // active, inactive, maintenance
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String
)
```

### 3. Menu

```kotlin
data class Menu(
    val id: String,
    @SerializedName("app_id")
    val appId: String,
    @SerializedName("menu_id")
    val menuId: String,
    val title: String,
    val icon: String?,
    @SerializedName("order_index")
    val orderIndex: Int,
    @SerializedName("parent_id")
    val parentId: String?,
    @SerializedName("menu_type")
    val menuType: String, // item, category, divider
    @SerializedName("action_type")
    val actionType: String?, // navigate, external_link, api_call
    @SerializedName("action_value")
    val actionValue: String?,
    @SerializedName("is_visible")
    val isVisible: Boolean,
    @SerializedName("is_enabled")
    val isEnabled: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String
)
```

### 4. Toolbar

```kotlin
data class Toolbar(
    val id: String,
    @SerializedName("app_id")
    val appId: String,
    @SerializedName("toolbar_id")
    val toolbarId: String,
    val title: String,
    val position: String, // top, bottom
    @SerializedName("background_color")
    val backgroundColor: String,
    @SerializedName("text_color")
    val textColor: String,
    val height: Int,
    @SerializedName("is_visible")
    val isVisible: Boolean,
    val buttons: List<ToolbarButton>,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String
)

data class ToolbarButton(
    val id: String,
    val title: String,
    val icon: String?,
    @SerializedName("action_type")
    val actionType: String, // navigate, external_link, api_call
    @SerializedName("action_value")
    val actionValue: String,
    @SerializedName("order_index")
    val orderIndex: Int
)
```

### 5. FCM Topic

```kotlin
data class FcmTopic(
    val id: String,
    @SerializedName("app_id")
    val appId: String,
    @SerializedName("topic_name")
    val topicName: String,
    @SerializedName("topic_id")
    val topicId: String,
    val description: String?,
    @SerializedName("is_default")
    val isDefault: Boolean,
    @SerializedName("is_active")
    val isActive: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String
)
```

### 6. Style

```kotlin
data class Style(
    val id: String,
    @SerializedName("app_id")
    val appId: String,
    @SerializedName("style_key")
    val styleKey: String,
    @SerializedName("style_value")
    val styleValue: String,
    @SerializedName("style_category")
    val styleCategory: String, // color, typography, spacing, component, layout
    val description: String?,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String
)
```

## 🔌 구현 예제

### 1. API Service 인터페이스

```kotlin
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

interface RemoteConfigService {
    @GET("config/{appId}")
    suspend fun getAppConfig(@Path("appId") appId: String): Response<RemoteConfigResponse>
    
    @GET("apps/{id}/menus")
    suspend fun getMenus(@Path("id") appId: String): Response<ApiResponse<List<Menu>>>
    
    @GET("apps/{id}/toolbars")
    suspend fun getToolbars(@Path("id") appId: String): Response<ApiResponse<List<Toolbar>>>
    
    @GET("apps/{id}/fcm_topics")
    suspend fun getFcmTopics(@Path("id") appId: String): Response<ApiResponse<List<FcmTopic>>>
    
    @GET("apps/{id}/styles")
    suspend fun getStyles(@Path("id") appId: String): Response<ApiResponse<List<Style>>>
}

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: String?
)
```

### 2. Retrofit 클라이언트 설정

```kotlin
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    private const val BASE_URL = "https://your-domain.vercel.app/api/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val remoteConfigService: RemoteConfigService = retrofit.create(RemoteConfigService::class.java)
}
```

### 3. Repository 클래스

```kotlin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RemoteConfigRepository {
    private val api = NetworkModule.remoteConfigService
    
    suspend fun getAppConfig(appId: String): Result<AppConfig> = withContext(Dispatchers.IO) {
        try {
            val response = api.getAppConfig(appId)
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true && body.data != null) {
                    Result.success(body.data)
                } else {
                    Result.failure(Exception(body?.error ?: "Unknown error"))
                }
            } else {
                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMenus(appId: String): Result<List<Menu>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getMenus(appId)
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true && body.data != null) {
                    Result.success(body.data)
                } else {
                    Result.failure(Exception(body?.error ?: "Unknown error"))
                }
            } else {
                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // 다른 메소드들도 동일한 패턴으로 구현...
}
```

### 4. ViewModel 사용 예제

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    private val repository = RemoteConfigRepository()
    
    private val _appConfig = MutableStateFlow<AppConfig?>(null)
    val appConfig: StateFlow<AppConfig?> = _appConfig.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadAppConfig(appId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            repository.getAppConfig(appId)
                .onSuccess { config ->
                    _appConfig.value = config
                }
                .onFailure { exception ->
                    _error.value = exception.message
                }
            
            _isLoading.value = false
        }
    }
}
```

### 5. Activity/Fragment에서 사용

```kotlin
import androidx.activity.viewModels
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    private val viewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        observeAppConfig()
        
        // 앱 설정 로드
        viewModel.loadAppConfig("com.example.shopping")
    }
    
    private fun observeAppConfig() {
        lifecycleScope.launch {
            viewModel.appConfig.collect { config ->
                config?.let { setupUI(it) }
            }
        }
        
        lifecycleScope.launch {
            viewModel.isLoading.collect { isLoading ->
                // 로딩 상태 처리
                if (isLoading) {
                    showLoadingDialog()
                } else {
                    hideLoadingDialog()
                }
            }
        }
        
        lifecycleScope.launch {
            viewModel.error.collect { error ->
                error?.let {
                    showErrorDialog(it)
                }
            }
        }
    }
    
    private fun setupUI(config: AppConfig) {
        // 메뉴 설정
        setupMenus(config.menus)
        
        // 툴바 설정
        setupToolbars(config.toolbars)
        
        // 스타일 적용
        applyStyles(config.styles)
        
        // FCM 토픽 구독
        subscribeFcmTopics(config.fcmTopics)
    }
}
```

## 🎯 사용 사례

### 1. 동적 메뉴 생성

```kotlin
fun setupMenus(menus: List<Menu>) {
    val visibleMenus = menus.filter { it.isVisible && it.isEnabled }
    val sortedMenus = visibleMenus.sortedBy { it.orderIndex }
    
    // 계층형 메뉴 구조 생성
    val rootMenus = sortedMenus.filter { it.parentId == null }
    val childMenusMap = sortedMenus.filter { it.parentId != null }
        .groupBy { it.parentId }
    
    rootMenus.forEach { menu ->
        when (menu.menuType) {
            "item" -> createMenuItem(menu)
            "category" -> createCategoryMenu(menu, childMenusMap[menu.id] ?: emptyList())
            "divider" -> createDivider()
        }
    }
}

private fun createMenuItem(menu: Menu) {
    // 메뉴 아이템 생성 및 클릭 리스너 설정
    val menuItem = MenuItem(menu.title, menu.icon)
    menuItem.setOnClickListener {
        handleMenuAction(menu.actionType, menu.actionValue)
    }
}

private fun handleMenuAction(actionType: String?, actionValue: String?) {
    when (actionType) {
        "navigate" -> {
            // 앱 내 화면 이동
            navigateToScreen(actionValue)
        }
        "external_link" -> {
            // 외부 링크 열기
            openExternalLink(actionValue)
        }
        "api_call" -> {
            // API 호출
            callApi(actionValue)
        }
    }
}
```

### 2. 동적 스타일 적용

```kotlin
fun applyStyles(styles: List<Style>) {
    val styleMap = styles.associateBy { it.styleKey }
    
    // 색상 적용
    styleMap["primary_color"]?.let { style ->
        val color = Color.parseColor(style.styleValue)
        setPrimaryColor(color)
    }
    
    // 텍스트 크기 적용
    styleMap["font_size_large"]?.let { style ->
        val size = style.styleValue.replace("sp", "").toFloat()
        setLargeTextSize(size)
    }
    
    // 패딩 적용
    styleMap["padding_medium"]?.let { style ->
        val padding = style.styleValue.replace("dp", "").toInt()
        setMediumPadding(padding.dpToPx())
    }
}

private fun Int.dpToPx(): Int {
    return (this * resources.displayMetrics.density).toInt()
}
```

### 3. FCM 토픽 구독

```kotlin
import com.google.firebase.messaging.FirebaseMessaging

fun subscribeFcmTopics(topics: List<FcmTopic>) {
    val firebaseMessaging = FirebaseMessaging.getInstance()
    
    topics.filter { it.isActive }.forEach { topic ->
        if (topic.isDefault) {
            // 기본 토픽은 자동 구독
            firebaseMessaging.subscribeToTopic(topic.topicId)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        Log.d("FCM", "토픽 구독 성공: ${topic.topicName}")
                    } else {
                        Log.e("FCM", "토픽 구독 실패: ${topic.topicName}")
                    }
                }
        } else {
            // 선택적 토픽은 사용자 설정에 따라 구독
            if (isTopicSubscribed(topic.topicId)) {
                firebaseMessaging.subscribeToTopic(topic.topicId)
            }
        }
    }
}
```

### 4. 캐싱 전략

```kotlin
class RemoteConfigManager {
    private val sharedPrefs = context.getSharedPreferences("remote_config", Context.MODE_PRIVATE)
    private val repository = RemoteConfigRepository()
    
    suspend fun getAppConfig(appId: String, forceRefresh: Boolean = false): AppConfig? {
        // 캐시된 데이터 확인
        if (!forceRefresh) {
            val cachedConfig = getCachedConfig(appId)
            if (cachedConfig != null && !isCacheExpired(appId)) {
                return cachedConfig
            }
        }
        
        // 서버에서 새 데이터 가져오기
        return repository.getAppConfig(appId).getOrNull()?.also { config ->
            cacheConfig(appId, config)
            updateCacheTimestamp(appId)
        }
    }
    
    private fun getCachedConfig(appId: String): AppConfig? {
        val json = sharedPrefs.getString("config_$appId", null)
        return json?.let { Gson().fromJson(it, AppConfig::class.java) }
    }
    
    private fun cacheConfig(appId: String, config: AppConfig) {
        val json = Gson().toJson(config)
        sharedPrefs.edit().putString("config_$appId", json).apply()
    }
    
    private fun isCacheExpired(appId: String): Boolean {
        val cacheTime = sharedPrefs.getLong("cache_time_$appId", 0)
        val currentTime = System.currentTimeMillis()
        val cacheValidityHours = 24 // 24시간
        return (currentTime - cacheTime) > (cacheValidityHours * 60 * 60 * 1000)
    }
}
```

## 🚀 모범 사례

### 1. 오류 처리

```kotlin
sealed class NetworkResult<T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error<T>(val message: String, val exception: Throwable? = null) : NetworkResult<T>()
    data class Loading<T>(val message: String = "Loading...") : NetworkResult<T>()
}

// 사용 예제
when (val result = repository.getAppConfig(appId)) {
    is NetworkResult.Success -> {
        // 성공 처리
        updateUI(result.data)
    }
    is NetworkResult.Error -> {
        // 오류 처리
        showError(result.message)
    }
    is NetworkResult.Loading -> {
        // 로딩 표시
        showLoading(result.message)
    }
}
```

### 2. 백그라운드 업데이트

```kotlin
class ConfigUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            val appId = inputData.getString("app_id") ?: return Result.failure()
            val configManager = RemoteConfigManager()
            
            configManager.getAppConfig(appId, forceRefresh = true)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

// WorkManager로 주기적 업데이트 설정
val workRequest = PeriodicWorkRequestBuilder<ConfigUpdateWorker>(12, TimeUnit.HOURS)
    .setInputData(workDataOf("app_id" to "com.example.shopping"))
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .build()

WorkManager.getInstance(context).enqueue(workRequest)
```

### 3. 성능 최적화

```kotlin
// 메모리 캐시와 디스크 캐시 결합
class CacheManager {
    private val memoryCache = LruCache<String, AppConfig>(10) // 최대 10개 설정 캐시
    private val diskCache = DiskLruCache.open(...)
    
    suspend fun getConfig(key: String): AppConfig? {
        // 1. 메모리 캐시 확인
        memoryCache.get(key)?.let { return it }
        
        // 2. 디스크 캐시 확인
        diskCache.get(key)?.let { cachedData ->
            val config = Gson().fromJson(cachedData, AppConfig::class.java)
            memoryCache.put(key, config) // 메모리 캐시에도 저장
            return config
        }
        
        return null
    }
    
    fun putConfig(key: String, config: AppConfig) {
        memoryCache.put(key, config)
        diskCache.put(key, Gson().toJson(config))
    }
}
```

## 📝 샘플 앱 설정

현재 시스템에 생성된 샘플 데이터:

- **앱 ID**: `com.example.shopping`
- **Remote Config URL**: `https://your-domain.vercel.app/api/config/com.example.shopping`

### 샘플 데이터 내용

1. **메뉴**: 홈, 카테고리(패션, 전자제품, 도서), 장바구니, 주문내역, 내 정보, 고객지원
2. **툴바**: 하단 툴바 (홈, 검색, 장바구니, 내 정보 버튼)
3. **FCM 토픽**: 전체 알림, 프로모션 알림, 주문 알림, 신상품 알림
4. **스타일**: 색상, 타이포그래피, 간격, 컴포넌트 스타일

이 가이드를 참고하여 Android 앱에서 Remote Config를 효과적으로 활용하세요! 🎉 