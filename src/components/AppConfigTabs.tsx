'use client';

import { useState } from 'react';
import { 
  Menu as MenuIcon, 
  Wrench, 
  Bell, 
  Palette,
  Settings,
  Send
} from 'lucide-react';
import { App } from '@/types/database';
import MenuManagement from '@/components/MenuManagement';
import ToolbarManagement from '@/components/ToolbarManagement';
import FcmTopicManagement from '@/components/FcmTopicManagement';
import FcmNotificationSender from '@/components/FcmNotificationSender';
import StyleManagement from '@/components/StyleManagement';

interface AppConfigTabsProps {
  app: App;
  onAppUpdated?: () => void;
}

type TabType = 'basic' | 'menu' | 'toolbar' | 'fcm' | 'notification' | 'style';

export default function AppConfigTabs({ app, onAppUpdated }: AppConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    app_name: app.app_name,
    app_id: app.app_id,
    package_name: app.package_name,
    version: app.version,
    status: app.status,
    description: app.description || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 앱 ID 변경 시 패키지명도 자동으로 동기화
    if (name === 'app_id') {
      setFormData(prev => ({
        ...prev,
        app_id: value,
        package_name: value, // 앱 ID와 패키지명 동기화
      }));
    } else if (name === 'package_name') {
      setFormData(prev => ({
        ...prev,
        package_name: value,
        app_id: value, // 패키지명과 앱 ID 동기화
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/apps/${app.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('앱 정보가 성공적으로 저장되었습니다.');
        onAppUpdated?.();
      } else {
        alert(result.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'basic' as TabType,
      name: '기본 설정',
      icon: Settings,
    },
    {
      id: 'menu' as TabType,
      name: '메뉴 관리',
      icon: MenuIcon,
    },
    {
      id: 'toolbar' as TabType,
      name: '툴바 관리',
      icon: Wrench,
    },
    {
      id: 'fcm' as TabType,
      name: 'FCM 토픽',
      icon: Bell,
    },
    {
      id: 'notification' as TabType,
      name: '알림 전송',
      icon: Send,
    },
    {
      id: 'style' as TabType,
      name: '스타일 설정',
      icon: Palette,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                기본 앱 설정
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    앱 이름
                  </label>
                  <input
                    type="text"
                    name="app_name"
                    value={formData.app_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {/* 앱 ID / 패키지명 통합 입력 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="ml-2">
                      <h4 className="text-sm font-medium text-blue-900">앱 식별자 설정</h4>
                      <p className="text-xs text-blue-700">앱 ID와 패키지명이 자동으로 동기화됩니다</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        앱 ID
                      </label>
                      <input
                        type="text"
                        name="app_id"
                        value={formData.app_id}
                        onChange={handleInputChange}
                        placeholder="com.example.myapp"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        변경 시 패키지명도 자동 업데이트
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        패키지명
                      </label>
                      <input
                        type="text"
                        name="package_name"
                        value={formData.package_name}
                        onChange={handleInputChange}
                        placeholder="com.example.myapp"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        변경 시 앱 ID도 자동 업데이트
                      </p>
                    </div>
                  </div>
                  
                  {formData.app_id === formData.package_name && formData.app_id && (
                    <div className="mt-2 flex items-center text-xs text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      앱 ID와 패키지명이 동기화되었습니다
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    버전
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    상태
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="maintenance">점검중</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    설명
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'menu':
        return <MenuManagement app={app} />;
      case 'toolbar':
        return <ToolbarManagement app={app} />;
      case 'fcm':
        return <FcmTopicManagement app={app} />;
      case 'notification':
        return <FcmNotificationSender app={app} />;
      case 'style':
        return <StyleManagement app={app} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {renderTabContent()}
      </div>
    </div>
  );
} 