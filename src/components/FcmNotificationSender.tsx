'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare, Users, Bell } from 'lucide-react';
import { App, AppFcmTopic } from '@/types/database';

interface NotificationForm {
  topic: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  image?: string;
}

interface FcmNotificationSenderProps {
  app: App;
}

export default function FcmNotificationSender({ app }: FcmNotificationSenderProps) {
  const [topics, setTopics] = useState<AppFcmTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    messageId?: string;
  } | null>(null);
  const [form, setForm] = useState<NotificationForm>({
    topic: '',
    title: '',
    body: '',
    data: {},
    image: '',
  });

  // FCM 토픽 목록 가져오기
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`/api/apps/${app.id}/fcm_topics`);
        const result = await response.json();
        if (result.success && result.data) {
          const activeTopics = result.data.filter((topic: AppFcmTopic) => topic.is_active);
          setTopics(activeTopics);
          if (activeTopics.length > 0) {
            setForm(prev => ({ ...prev, topic: activeTopics[0].topic_id }));
          }
        }
      } catch (error) {
        console.error('FCM 토픽 조회 실패:', error);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, [app.id]);

  // 토픽 알림 전송
  const sendTopicNotification = async () => {
    if (!form.title || !form.body || !form.topic) {
      alert('제목, 내용, 토픽을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setResult(null);

    const payload = {
      topic: form.topic,
      title: form.title,
      body: form.body,
      data: form.data,
      image: form.image,
    };

    console.log('🚀 토픽 알림 전송 시도:', payload);

    try {
      const response = await fetch('/api/fcm/send-to-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 API 응답 상태:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📨 API 응답 데이터:', data);
      
      setResult(data);
      
      if (data.success) {
        // 전송 성공 시 폼 초기화
        setForm(prev => ({
          ...prev,
          title: '',
          body: '',
          data: {},
          image: '',
        }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('❌ 토픽 알림 전송 오류:', error);
      setResult({ success: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // 전체 브로드캐스트 전송
  const sendBroadcast = async () => {
    if (!form.title || !form.body) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setResult(null);

    const payload = {
      title: form.title,
      body: form.body,
      data: form.data,
      image: form.image,
    };

    console.log('🚀 브로드캐스트 전송 시도:', payload);

    try {
      const response = await fetch(`/api/fcm/broadcast/${app.app_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 브로드캐스트 응답 상태:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📨 브로드캐스트 응답 데이터:', data);
      
      setResult(data);
      
      if (data.success) {
        // 전송 성공 시 폼 초기화
        setForm(prev => ({
          ...prev,
          title: '',
          body: '',
          data: {},
          image: '',
        }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('❌ 브로드캐스트 전송 오류:', error);
      setResult({ success: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (topicsLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-6">
          <Bell className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            FCM 알림 전송
          </h3>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              활성화된 FCM 토픽이 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              FCM 토픽 탭에서 토픽을 먼저 생성하고 활성화하세요.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 토픽 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전송 토픽 선택
              </label>
              <select
                name="topic"
                value={form.topic}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.topic_id}>
                    {topic.topic_name} {topic.is_default && '(기본)'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                선택한 토픽을 구독한 사용자들에게 알림이 전송됩니다.
              </p>
              
              {/* 선택된 토픽 정보 및 검증 */}
              {form.topic && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <div className="font-medium text-blue-800">선택된 토픽 정보:</div>
                  <div className="text-blue-700">토픽 ID: <code className="bg-blue-100 px-1 rounded">{form.topic}</code></div>
                  {(() => {
                    const selectedTopic = topics.find(t => t.topic_id === form.topic);
                    const isValidTopicId = /^[a-zA-Z0-9_-]+$/.test(form.topic);
                    
                    return (
                      <>
                        {selectedTopic && (
                          <>
                            <div className="text-blue-700">토픽명: {selectedTopic.topic_name}</div>
                            <div className="text-blue-700">기본 토픽: {selectedTopic.is_default ? '예' : '아니오'}</div>
                            <div className="text-blue-700">활성 상태: {selectedTopic.is_active ? '활성' : '비활성'}</div>
                          </>
                        )}
                        {!isValidTopicId && (
                          <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded">
                            <div className="font-medium text-red-800">⚠️ 토픽 ID 오류</div>
                            <div className="text-red-700 text-xs">
                              Firebase FCM은 한글을 지원하지 않습니다. FCM 토픽 탭에서 토픽 ID를 영문으로 수정하세요.
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 알림 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 제목 *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="알림 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                maxLength={100}
              />
            </div>

            {/* 알림 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 내용 *
              </label>
              <textarea
                name="body"
                value={form.body}
                onChange={handleInputChange}
                placeholder="알림 내용을 입력하세요"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {form.body.length}/500 글자
              </p>
            </div>

            {/* 이미지 URL (선택사항) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL (선택사항)
              </label>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                알림에 표시할 이미지 URL을 입력하세요.
              </p>
            </div>

            {/* 전송 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={sendTopicNotification}
                disabled={loading || !form.title || !form.body || !form.topic}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? '전송 중...' : '토픽 알림 전송'}
              </button>

              <button
                onClick={sendBroadcast}
                disabled={loading || !form.title || !form.body}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="h-4 w-4 mr-2" />
                {loading ? '전송 중...' : '전체 브로드캐스트'}
              </button>
            </div>

            {/* 빠른 전송 버튼들 */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">빠른 전송</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setForm(prev => ({
                    ...prev,
                    title: '앱 업데이트 알림',
                    body: '새로운 버전이 출시되었습니다! 지금 업데이트하여 새로운 기능을 확인해보세요.',
                  }))}
                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  📱 앱 업데이트 알림
                </button>
                <button
                  onClick={() => setForm(prev => ({
                    ...prev,
                    title: '서비스 점검 안내',
                    body: '더 나은 서비스 제공을 위해 시스템 점검을 진행합니다.',
                  }))}
                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  🔧 서비스 점검 안내
                </button>
                <button
                  onClick={() => setForm(prev => ({
                    ...prev,
                    title: '이벤트 알림',
                    body: '특별 이벤트가 진행중입니다! 놓치지 마세요.',
                  }))}
                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  🎉 이벤트 알림
                </button>
                <button
                  onClick={() => setForm(prev => ({
                    ...prev,
                    title: '중요 공지사항',
                    body: '중요한 공지사항이 있습니다. 확인해주세요.',
                  }))}
                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  📢 중요 공지사항
                </button>
              </div>
            </div>

            {/* 디버깅 도구 */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">🔧 디버깅 도구</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-md text-xs">
                  <div className="font-medium text-gray-800 mb-2">문제 해결 가이드:</div>
                  <div className="space-y-1 text-gray-600">
                    <div>1. <strong>토픽 구독 확인:</strong> 모바일 앱에서 해당 토픽을 구독했는지 확인</div>
                    <div>2. <strong>토픽 ID 검증:</strong> 토픽 ID가 Firebase Console과 일치하는지 확인</div>
                    <div>3. <strong>브라우저 콘솔:</strong> F12 → Console에서 자세한 로그 확인</div>
                    <div>4. <strong>Node.js 서버:</strong> FCM API 서버가 정상 동작하는지 확인</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('https://remote-config-node-express.onrender.com/api/health');
                        const data = await response.json();
                        alert(`FCM API 서버 상태: ${data.status || 'OK'}`);
                      } catch (error) {
                        alert('FCM API 서버 연결 실패');
                      }
                    }}
                    className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-md border border-yellow-300"
                  >
                    🩺 서버 상태 확인
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('📊 현재 FCM 토픽 목록:', topics);
                      console.log('📋 선택된 폼 데이터:', form);
                      console.log('📱 앱 정보:', app);
                      alert('콘솔(F12)에서 디버깅 정보를 확인하세요!');
                    }}
                    className="px-3 py-2 text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-md border border-purple-300"
                  >
                    📊 디버깅 정보 출력
                  </button>
                </div>

                {/* 토픽 구독 문제 진단 */}
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="font-medium text-orange-800 mb-2">🚨 토픽 알림 수신 실패 진단</div>
                  <div className="space-y-2 text-xs text-orange-700">
                    <div className="font-medium">가능한 원인들:</div>
                    <div className="ml-2 space-y-1">
                      <div>• <strong>토픽 미구독:</strong> 앱에서 해당 토픽을 구독하지 않음</div>
                      <div>• <strong>토픽 ID 불일치:</strong> 앱과 서버의 토픽 ID가 다름</div>
                      <div>• <strong>Firebase 프로젝트 설정:</strong> 잘못된 Firebase 프로젝트 연결</div>
                      <div>• <strong>FCM 토큰 문제:</strong> 기기의 FCM 토큰이 유효하지 않음</div>
                    </div>
                    <div className="mt-2 font-medium">해결 방법:</div>
                    <div className="ml-2 space-y-1">
                      <div>1. 앱에서 <code className="bg-orange-100 px-1 rounded">FirebaseMessaging.getInstance().subscribeToTopic("{form.topic}")</code> 호출</div>
                      <div>2. Firebase Console에서 토픽 이름 확인</div>
                      <div>3. 앱 재시작 후 토픽 구독 재시도</div>
                      <div>4. 브로드캐스트가 정상 작동하므로 FCM 설정은 올바름</div>
                    </div>
                  </div>
                </div>

                {/* 토픽 구독 테스트 도구 */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="font-medium text-blue-800 mb-2">🧪 토픽 구독 테스트</div>
                  <div className="space-y-2">
                    <div className="text-xs text-blue-700">
                      현재 선택된 토픽: <code className="bg-blue-100 px-1 rounded">{form.topic}</code>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={async () => {
                          try {
                            // 테스트용 간단한 토픽 메시지 전송
                            const testPayload = {
                              topic: form.topic,
                              title: '🧪 토픽 구독 테스트',
                              body: `${form.topic} 토픽 구독이 정상적으로 작동하는지 확인하는 테스트 메시지입니다.`,
                              data: { test: 'true', timestamp: new Date().toISOString() }
                            };
                            
                            const response = await fetch('/api/fcm/send-to-topic', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(testPayload),
                            });
                            
                            const result = await response.json();
                            if (result.success) {
                              alert('✅ 토픽 테스트 메시지 전송 완료!\n\n앱에서 알림을 받았다면 토픽 구독이 정상입니다.\n받지 못했다면 앱에서 토픽 구독을 확인하세요.');
                            } else {
                              alert('❌ 토픽 테스트 실패: ' + (result.error || '알 수 없는 오류'));
                            }
                          } catch (error) {
                            alert('❌ 토픽 테스트 중 오류 발생');
                          }
                        }}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md border border-blue-300"
                      >
                        🧪 토픽 구독 테스트
                      </button>
                      
                      <button
                        onClick={() => {
                          const subscribeCode = `
// Android (Kotlin)
FirebaseMessaging.getInstance().subscribeToTopic("${form.topic}")
    .addOnCompleteListener { task ->
        if (task.isSuccessful) {
            Log.d("FCM", "토픽 구독 성공: ${form.topic}")
        } else {
            Log.e("FCM", "토픽 구독 실패: ${form.topic}")
        }
    }

// iOS (Swift)
Messaging.messaging().subscribe(toTopic: "${form.topic}") { error in
    if let error = error {
        print("토픽 구독 실패: \\(error)")
    } else {
        print("토픽 구독 성공: ${form.topic}")
    }
}`;
                          
                          navigator.clipboard.writeText(subscribeCode).then(() => {
                            alert('📋 토픽 구독 코드가 클립보드에 복사되었습니다!\n\n앱 개발자에게 전달하여 해당 토픽을 구독하도록 요청하세요.');
                          }).catch(() => {
                            alert('토픽 구독 코드:\n\n' + subscribeCode);
                          });
                        }}
                        className="px-3 py-2 text-sm bg-green-100 text-green-800 hover:bg-green-200 rounded-md border border-green-300"
                      >
                        📋 구독 코드 복사
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 표시 */}
            {result && (
              <div className={`p-4 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.success ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? '✅ 전송 성공!' : '❌ 전송 실패'}
                    </h3>
                    <div className={`mt-2 text-sm ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <p>{result.message || result.error}</p>
                      {result.messageId && (
                        <p className="mt-1 font-mono text-xs">
                          Message ID: {result.messageId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 