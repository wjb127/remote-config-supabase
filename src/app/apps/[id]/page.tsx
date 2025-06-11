'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Settings, 
  Menu as MenuIcon, 
  Palette, 
  Bell,
  Wrench
} from 'lucide-react';
import { App, ApiResponse } from '@/types/database';
import AppConfigTabs from '@/components/AppConfigTabs';

interface AppPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AppPage({ params }: AppPageProps) {
  const router = useRouter();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/apps/${id}`);
        const result: ApiResponse<App> = await response.json();
        
        if (result.success && result.data) {
          setApp(result.data);
        } else {
          alert('앱을 찾을 수 없습니다.');
          router.push('/');
        }
      } catch {
        alert('앱 정보를 불러오는 중 오류가 발생했습니다.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!app) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                돌아가기
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {app.app_name}
                </h1>
                <p className="text-sm text-gray-500">{app.app_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                app.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : app.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {app.status === 'active' ? '활성' : app.status === 'maintenance' ? '점검중' : '비활성'}
              </span>
              <button
                onClick={() => window.open(`/api/config/${app.app_id}`, '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                API 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              앱 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">패키지명</dt>
                <dd className="mt-1 text-sm text-gray-900">{app.package_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">버전</dt>
                <dd className="mt-1 text-sm text-gray-900">{app.version}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(app.created_at).toLocaleDateString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">수정일</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(app.updated_at).toLocaleDateString('ko-KR')}
                </dd>
              </div>
            </div>
            {app.description && (
              <div className="mt-6">
                <dt className="text-sm font-medium text-gray-500">설명</dt>
                <dd className="mt-1 text-sm text-gray-900">{app.description}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MenuIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      메뉴
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">-</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wrench className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      툴바
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">-</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      FCM 토픽
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">-</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Palette className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      스타일
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">-</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Tabs */}
        <AppConfigTabs app={app} />
      </div>
    </div>
  );
} 