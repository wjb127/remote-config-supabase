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
  const [result, setResult] = useState<any>(null);
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

    try {
      const response = await fetch('/api/fcm/send-to-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: form.topic,
          title: form.title,
          body: form.body,
          data: form.data,
          image: form.image,
        }),
      });

      const data = await response.json();
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
    } catch (error: any) {
      setResult({ success: false, error: error.message });
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

    try {
      const response = await fetch(`/api/fcm/broadcast/${app.app_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          data: form.data,
          image: form.image,
        }),
      });

      const data = await response.json();
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
    } catch (error: any) {
      setResult({ success: false, error: error.message });
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