'use client';

import { App } from '@/types/database';

interface FcmTopicManagementProps {
  app: App;
}

export default function FcmTopicManagement({ }: FcmTopicManagementProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          FCM 토픽 관리
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-500">FCM 토픽 관리 기능은 곧 추가됩니다.</p>
        </div>
      </div>
    </div>
  );
} 