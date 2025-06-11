'use client';

import { useState } from 'react';
import { 
  Menu as MenuIcon, 
  Wrench, 
  Bell, 
  Palette,
  Settings
} from 'lucide-react';
import { App } from '@/types/database';
import MenuManagement from '@/components/MenuManagement';
import ToolbarManagement from '@/components/ToolbarManagement';
import FcmTopicManagement from '@/components/FcmTopicManagement';
import StyleManagement from '@/components/StyleManagement';

interface AppConfigTabsProps {
  app: App;
}

type TabType = 'basic' | 'menu' | 'toolbar' | 'fcm' | 'style';

export default function AppConfigTabs({ app }: AppConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

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
                    defaultValue={app.app_name}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    앱 ID
                  </label>
                  <input
                    type="text"
                    defaultValue={app.app_id}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    패키지명
                  </label>
                  <input
                    type="text"
                    defaultValue={app.package_name}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    버전
                  </label>
                  <input
                    type="text"
                    defaultValue={app.version}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    상태
                  </label>
                  <select
                    defaultValue={app.status}
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
                    defaultValue={app.description || ''}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    저장
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