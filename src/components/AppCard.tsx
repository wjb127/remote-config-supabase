'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Smartphone, 
  Settings, 
  Trash2, 
  Eye,
  AlertCircle 
} from 'lucide-react';
import { App, ApiResponse } from '@/types/database';

interface AppCardProps {
  app: App;
  onDeleted: (appId: string) => void;
}

export default function AppCard({ app, onDeleted }: AppCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'maintenance':
        return '점검중';
      default:
        return status;
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 앱을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/apps/${app.id}`, {
        method: 'DELETE',
      });
      const result: ApiResponse<null> = await response.json();
      
      if (result.success) {
        onDeleted(app.id);
      } else {
        alert(result.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManage = () => {
    router.push(`/apps/${app.id}`);
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {app.app_name}
              </h3>
              <p className="text-sm text-gray-500">{app.app_id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
            {getStatusText(app.status)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">패키지명:</span>
            <span className="text-gray-900 font-medium">{app.package_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">버전:</span>
            <span className="text-gray-900 font-medium">{app.version}</span>
          </div>
          {app.description && (
            <div className="text-sm text-gray-600 mt-2">
              {app.description}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            생성일: {new Date(app.created_at).toLocaleDateString('ko-KR')}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleManage}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings className="h-3 w-3 mr-1" />
              관리
            </button>
            <button
              onClick={() => window.open(`/api/config/${app.app_id}`, '_blank')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Eye className="h-3 w-3 mr-1" />
              API
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? (
                <AlertCircle className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3 mr-1" />
              )}
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 