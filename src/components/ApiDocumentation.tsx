'use client';

import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Download, Code, Smartphone, Globe, Bell } from 'lucide-react';
import { App } from '@/types/database';

interface ApiDocumentationProps {
  app: App;
}

interface ConfigData {
  app: {
    id: string;
    app_name: string;
    app_id: string;
    package_name: string;
    version: string;
    description?: string;
    status: string;
  };
  menus: Array<{
    id: string;
    menu_id: string;
    title: string;
    icon?: string;
    order_index: number;
    parent_id?: string;
    menu_type: string;
    action_type?: string;
    action_value?: string;
    is_visible: boolean;
    is_enabled: boolean;
  }>;
  toolbars: Array<{
    id: string;
    toolbar_id: string;
    title: string;
    position: string;
    background_color: string;
    text_color: string;
    height: number;
    is_visible: boolean;
    buttons: Record<string, unknown>[];
  }>;
  fcm_topics: Array<{
    id: string;
    topic_name: string;
    topic_id: string;
    description?: string;
    is_default: boolean;
    is_active: boolean;
  }>;
  styles: Array<{
    id: string;
    style_key: string;
    style_value: string;
    style_category: string;
    description?: string;
  }>;
}

export default function ApiDocumentation({ app }: ApiDocumentationProps) {
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [copySuccess, setCopySuccess] = useState<string>('');

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://remote-config-supabase.vercel.app' 
    : 'http://localhost:3000';

  useEffect(() => {
    fetchConfigData();
  }, [app.app_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConfigData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/config/${app.app_id}`);
      const result = await response.json();
      
      if (result.success) {
        setConfigData(result.data);
      }
    } catch (error) {
      console.error('Config 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const generateKotlinModel = () => {
    if (!configData) return '';

    const menuFields = configData.menus.length > 0 ? Object.keys(configData.menus[0]).filter(key => key !== 'id' && key !== 'app_id').join(',\n    val ') : '';
    const styleFields = configData.styles.length > 0 ? Object.keys(configData.styles[0]).filter(key => key !== 'id' && key !== 'app_id').join(',\n    val ') : '';

    return `// Kotlin 데이터 모델
data class RemoteConfigResponse(
    val success: Boolean,
    val data: AppConfig?,
    val error: String?
)

data class AppConfig(
    val app: AppInfo,
    val menus: List<MenuItem>,
    val toolbars: List<Toolbar>,
    val fcm_topics: List<FcmTopic>,
    val styles: List<Style>
)

data class AppInfo(
    val app_name: String,
    val app_id: String,
    val package_name: String,
    val version: String,
    val description: String?,
    val status: String
)

data class MenuItem(${menuFields ? `
    val ${menuFields}: String
` : `
    val menu_id: String,
    val title: String,
    val icon: String?,
    val action_value: String?
`})

data class Style(${styleFields ? `
    val ${styleFields}: String
` : `
    val style_key: String,
    val style_value: String,
    val style_category: String
`})`;
  };

  const generateRetrofitCode = () => {
    return `// Retrofit API 인터페이스
interface RemoteConfigApi {
    @GET("api/config/{appId}")
    suspend fun getConfig(@Path("appId") appId: String): RemoteConfigResponse
}

// Retrofit 클라이언트 설정
object ApiClient {
    private const val BASE_URL = "${baseUrl}/"
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val remoteConfigApi: RemoteConfigApi = retrofit.create(RemoteConfigApi::class.java)
}

// 사용 예시
class RemoteConfigRepository {
    private val api = ApiClient.remoteConfigApi
    
    suspend fun loadConfig(): AppConfig? {
        return try {
            val response = api.getConfig("${app.app_id}")
            if (response.success) {
                response.data
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}`;
  };

  const generateIndividualApiCode = () => {
    return `// 개별 데이터 조회용 API 인터페이스
interface IndividualApi {
    @GET("api/apps/{appId}/menus")
    suspend fun getMenus(@Path("appId") appId: String): ApiResponse<List<MenuItem>>
    
    @GET("api/apps/{appId}/toolbars")
    suspend fun getToolbars(@Path("appId") appId: String): ApiResponse<List<Toolbar>>
    
    @GET("api/apps/{appId}/fcm_topics")
    suspend fun getFcmTopics(@Path("appId") appId: String): ApiResponse<List<FcmTopic>>
    
    @GET("api/apps/{appId}/styles")
    suspend fun getStyles(@Path("appId") appId: String): ApiResponse<List<Style>>
    
    @GET("api/apps/{appId}/stats")
    suspend fun getStats(@Path("appId") appId: String): ApiResponse<AppStats>
}

// 개별 API 사용 예시
class IndividualRepository {
    private val api = ApiClient.retrofit.create(IndividualApi::class.java)
    
    // 메뉴만 조회 (관리자용 - 숨김 메뉴 포함)
    suspend fun getMenusOnly(): List<MenuItem>? {
        return try {
            val response = api.getMenus("${app.id}")
            if (response.success) response.data else null
        } catch (e: Exception) { null }
    }
    
    // 앱 통계 조회
    suspend fun getAppStats(): AppStats? {
        return try {
            val response = api.getStats("${app.id}")
            if (response.success) response.data else null
        } catch (e: Exception) { null }
    }
    
    // 실시간 메뉴 업데이트 확인
    suspend fun checkMenuUpdates(): Boolean {
        val currentMenus = getMenusOnly()
        // 캐시된 메뉴와 비교하여 변경사항 확인
        return currentMenus != cachedMenus
    }
}`;
  };

  const sections = [
    { id: 'overview', name: '개요', icon: Globe },
    { id: 'endpoints', name: 'API 엔드포인트', icon: ExternalLink },
    { id: 'kotlin', name: 'Kotlin 구현', icon: Smartphone },
    { id: 'examples', name: '사용 예시', icon: Code },
  ];

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {app.app_name} API 문서
              </h3>
              <p className="text-gray-600">
                이 API를 사용하여 모바일 앱에서 {app.app_name}의 설정을 동적으로 로드할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">기본 정보</h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">앱 ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{app.app_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">버전</dt>
                  <dd className="text-sm text-gray-900">{app.version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">패키지명</dt>
                  <dd className="text-sm text-gray-900 font-mono">{app.package_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">상태</dt>
                  <dd className="text-sm text-gray-900">{app.status}</dd>
                </div>
              </dl>
            </div>

            {configData && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">현재 설정 요약</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-blue-700">
                    메뉴: <span className="font-semibold">{configData.menus.length}개</span>
                  </div>
                  <div className="text-blue-700">
                    툴바: <span className="font-semibold">{configData.toolbars.length}개</span>
                  </div>
                  <div className="text-blue-700">
                    FCM 토픽: <span className="font-semibold">{configData.fcm_topics.length}개</span>
                  </div>
                  <div className="text-blue-700">
                    스타일: <span className="font-semibold">{configData.styles.length}개</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'endpoints' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">API 엔드포인트</h3>
            </div>

            {/* 메인 Config API */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <h4 className="font-medium text-blue-900">메인 Remote Config API (모바일 앱용)</h4>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-3">
                      GET
                    </span>
                    <code className="text-sm font-mono">/api/config/{app.app_id}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${baseUrl}/api/config/${app.app_id}`, 'Config API URL')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-blue-700 mb-3">전체 앱 설정을 한 번에 조회합니다. 모바일 앱에서 가장 많이 사용하는 API입니다.</p>
                
                <div className="bg-white rounded p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">전체 URL:</p>
                  <code className="text-sm font-mono text-gray-900">{baseUrl}/api/config/{app.app_id}</code>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(`${baseUrl}/api/config/${app.app_id}`, '_blank')}
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    브라우저에서 보기
                  </button>
                </div>
              </div>

              {copySuccess === 'Config API URL' && (
                <div className="text-green-600 text-sm">✓ Config API URL이 복사되었습니다</div>
              )}
            </div>

            {/* 개별 데이터 조회 API들 */}
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                <h4 className="font-medium text-gray-900">개별 데이터 조회 API (관리자/고급 사용자용)</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                특정 데이터만 필요하거나 관리 목적으로 사용할 수 있는 개별 API들입니다.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {/* 메뉴 API */}
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                        GET
                      </span>
                      <code className="text-xs font-mono">/api/apps/{app.id}/menus</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${baseUrl}/api/apps/${app.id}/menus`, 'Menus API')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">메뉴 목록 조회 (모든 메뉴, 관리자용)</p>
                  <div className="text-xs text-gray-500">
                    반환: 앱의 모든 메뉴 (숨김 메뉴 포함), order_index 순 정렬
                  </div>
                </div>

                {/* 툴바 API */}
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                        GET
                      </span>
                      <code className="text-xs font-mono">/api/apps/{app.id}/toolbars</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${baseUrl}/api/apps/${app.id}/toolbars`, 'Toolbars API')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">툴바 목록 조회</p>
                  <div className="text-xs text-gray-500">
                    반환: 앱의 모든 툴바 설정과 버튼 정보
                  </div>
                </div>

                {/* FCM 토픽 API */}
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                        GET
                      </span>
                      <code className="text-xs font-mono">/api/apps/{app.id}/fcm_topics</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${baseUrl}/api/apps/${app.id}/fcm_topics`, 'FCM Topics API')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">FCM 토픽 목록 조회</p>
                  <div className="text-xs text-gray-500">
                    반환: 앱의 모든 FCM 토픽 (비활성 토픽 포함)
                  </div>
                </div>

                {/* 스타일 API */}
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                        GET
                      </span>
                      <code className="text-xs font-mono">/api/apps/{app.id}/styles</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${baseUrl}/api/apps/${app.id}/styles`, 'Styles API')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">스타일 설정 조회</p>
                  <div className="text-xs text-gray-500">
                    반환: 앱의 모든 스타일 설정 (카테고리별 분류)
                  </div>
                </div>

                {/* 앱 통계 API */}
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                        GET
                      </span>
                      <code className="text-xs font-mono">/api/apps/{app.id}/stats</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${baseUrl}/api/apps/${app.id}/stats`, 'Stats API')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">앱 통계 정보 조회</p>
                  <div className="text-xs text-gray-500">
                    반환: 메뉴, 툴바, FCM 토픽, 스타일의 개수와 상태 통계
                  </div>
                </div>
              </div>

              {(copySuccess === 'Menus API' || copySuccess === 'Toolbars API' || 
                copySuccess === 'FCM Topics API' || copySuccess === 'Styles API' || 
                copySuccess === 'Stats API') && (
                <div className="text-green-600 text-sm mt-2">✓ API URL이 복사되었습니다</div>
              )}
            </div>

            {/* FCM 알림 기능 (기존) */}
            {configData && configData.fcm_topics.length > 0 && (
              <div className="border rounded-lg p-4 bg-orange-50">
                <div className="flex items-center mb-3">
                  <Bell className="h-5 w-5 text-orange-600 mr-2" />
                  <h4 className="font-medium text-gray-900">FCM 알림 기능</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  이 앱은 {configData.fcm_topics.length}개의 FCM 토픽이 설정되어 있어 푸시 알림을 받을 수 있습니다.
                </p>
                <div className="bg-white rounded p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">FCM 서버:</p>
                  <code className="text-sm font-mono text-gray-900">https://remote-config-node-express.onrender.com/</code>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">설정된 토픽:</p>
                  <ul className="space-y-1">
                    {configData.fcm_topics.slice(0, 3).map((topic, index) => (
                      <li key={index} className="text-gray-700">
                        • <code className="text-xs bg-gray-100 px-1 rounded">{topic.topic_id}</code> - {topic.topic_name}
                      </li>
                    ))}
                    {configData.fcm_topics.length > 3 && (
                      <li className="text-gray-500">...외 {configData.fcm_topics.length - 3}개</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {configData && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">응답 예시</h4>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  <code>{JSON.stringify({
                    success: true,
                    data: {
                      app: {
                        app_name: configData.app.app_name,
                        app_id: configData.app.app_id,
                        version: configData.app.version,
                        status: configData.app.status
                      },
                      menus: configData.menus.slice(0, 2),
                      toolbars: configData.toolbars.slice(0, 1),
                      fcm_topics: configData.fcm_topics.slice(0, 2),
                      styles: configData.styles.slice(0, 3)
                    }
                  }, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {activeSection === 'kotlin' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kotlin/Android 구현</h3>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">1. 데이터 모델</h4>
                  <button
                    onClick={() => copyToClipboard(generateKotlinModel(), 'Kotlin 모델')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  <code>{generateKotlinModel()}</code>
                </pre>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">2. Retrofit API</h4>
                  <button
                    onClick={() => copyToClipboard(generateRetrofitCode(), 'Retrofit 코드')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  <code>{generateRetrofitCode()}</code>
                </pre>
              </div>

              {copySuccess === 'Kotlin 모델' && (
                <div className="text-green-600 text-sm">✓ Kotlin 모델 코드가 복사되었습니다</div>
              )}
              {copySuccess === 'Retrofit 코드' && (
                <div className="text-green-600 text-sm">✓ Retrofit 코드가 복사되었습니다</div>
              )}
            </div>

                          <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">3. 개별 API 인터페이스</h4>
                  <button
                    onClick={() => copyToClipboard(generateIndividualApiCode(), 'Individual API 코드')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  <code>{generateIndividualApiCode()}</code>
                </pre>
              </div>

              {copySuccess === 'Individual API 코드' && (
                <div className="text-green-600 text-sm">✓ 개별 API 코드가 복사되었습니다</div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">의존성 추가</h4>
                <p className="text-sm text-yellow-700 mb-2">build.gradle.kts (Module: app)에 다음을 추가하세요:</p>
                <pre className="bg-white rounded p-2 text-xs">
                  <code>{`implementation("com.squareup.retrofit2:retrofit:2.11.0")
implementation("com.squareup.retrofit2:converter-gson:2.11.0")
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")`}</code>
                </pre>
              </div>
          </div>
        )}

        {activeSection === 'examples' && configData && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">사용 예시</h3>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">메뉴 구성 예시</h4>
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm text-gray-600 mb-2">현재 {configData.menus.length}개의 메뉴가 설정되어 있습니다:</p>
                  <ul className="text-sm space-y-1">
                    {configData.menus.slice(0, 5).map((menu, index) => (
                      <li key={index} className="text-gray-700">
                        • {menu.title} ({menu.menu_type})
                      </li>
                    ))}
                    {configData.menus.length > 5 && (
                      <li className="text-gray-500">...외 {configData.menus.length - 5}개</li>
                    )}
                  </ul>
                </div>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  <code>{`// 메뉴 동적 구성 예시
fun setupMenu(menus: List<MenuItem>) {
    menus.filter { it.is_visible }.forEach { menu ->
        when (menu.menu_type) {
            "item" -> addMenuItem(menu.title, menu.icon, menu.action_value)
            "category" -> addMenuCategory(menu.title)
            "divider" -> addMenuDivider()
        }
    }
}`}</code>
                </pre>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">스타일 적용 예시</h4>
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm text-gray-600 mb-2">현재 {configData.styles.length}개의 스타일이 설정되어 있습니다:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {configData.styles.slice(0, 6).map((style, index) => (
                      <div key={index} className="text-gray-700">
                        <span className="font-mono">{style.style_key}:</span> {style.style_value}
                      </div>
                    ))}
                  </div>
                </div>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  <code>{`// 스타일 동적 적용 예시
fun applyStyles(styles: List<Style>) {
    styles.forEach { style ->
        when (style.style_category) {
            "color" -> applyColorStyle(style.style_key, style.style_value)
            "typography" -> applyTextStyle(style.style_key, style.style_value)
            "layout" -> applyLayoutStyle(style.style_key, style.style_value)
        }
    }
}`}</code>
                </pre>
              </div>

              {configData.fcm_topics.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">FCM 토픽 구독 예시</h4>
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm text-gray-600 mb-2">설정된 FCM 토픽:</p>
                    <ul className="text-sm space-y-1">
                      {configData.fcm_topics.map((topic, index) => (
                        <li key={index} className="text-gray-700">
                          • {topic.topic_name} ({topic.topic_id}) {topic.is_default ? '- 기본' : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                    <code>{`// FCM 토픽 구독 예시
fun subscribeFcmTopics(topics: List<FcmTopic>) {
    topics.filter { it.is_active }.forEach { topic ->
        FirebaseMessaging.getInstance().subscribeToTopic(topic.topic_id)
        if (topic.is_default) {
            // 기본 토픽은 자동 구독
        }
    }
}`}</code>
                  </pre>
                </div>
              )}

              <div className="border rounded-lg p-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-3">개별 API 사용 시나리오</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">관리자 대시보드:</span> 개별 API로 특정 데이터만 조회하여 성능 최적화
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">실시간 업데이트:</span> 특정 부분만 변경될 때 해당 API만 호출
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">디버깅/테스트:</span> 개별 컴포넌트 테스트 시 해당 API만 사용
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">통계 모니터링:</span> stats API로 앱 상태 모니터링
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🌐 서버 정보</h4>
              <div className="space-y-2 text-sm text-blue-700 mb-3">
                <div>
                  <span className="font-medium">Remote Config API:</span> {baseUrl}
                </div>
                <div>
                  <span className="font-medium">FCM 알림 서버:</span> https://remote-config-node-express.onrender.com/
                </div>
              </div>
              <h4 className="font-medium text-blue-900 mb-2">📱 완전한 구현 가이드</h4>
              <p className="text-sm text-blue-700 mb-3">
                더 자세한 구현 방법은 다음 문서들을 참고하세요:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  <a href="/docs/KOTLIN_SIMPLE_GUIDE.md" target="_blank" className="hover:underline">
                    Kotlin 초간단 테스트 가이드
                  </a>
                </div>
                <div className="flex items-center text-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  <a href="/docs/KOTLIN_API_GUIDE.md" target="_blank" className="hover:underline">
                    Kotlin 완전한 API 가이드
                  </a>
                </div>
                <div className="flex items-center text-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  <a href="/docs/API_DOCUMENTATION.md" target="_blank" className="hover:underline">
                    전체 API 문서
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 