'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { AppFcmTopic, ApiResponse } from '@/types/database';

interface CreateFcmTopicRequest {
  topic_name: string;
  topic_id: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

interface CreateFcmTopicModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  appId: string;
}

export default function CreateFcmTopicModal({ open, onClose, onCreated, appId }: CreateFcmTopicModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFcmTopicRequest>({
    topic_name: '',
    topic_id: '',
    description: '',
    is_default: false,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/fcm_topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AppFcmTopic> = await response.json();

      if (result.success) {
        alert('FCM 토픽이 성공적으로 생성되었습니다.');
        setFormData({
          topic_name: '',
          topic_id: '',
          description: '',
          is_default: false,
          is_active: true,
        });
        onCreated();
      } else {
        alert(result.error || 'FCM 토픽 생성 중 오류가 발생했습니다.');
      }
    } catch {
      alert('FCM 토픽 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-60"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* 배경 클릭 시 닫기 */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 모달 컨텐츠 */}
      <div 
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl transform scale-100 transition-all duration-200 ease-out"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '28rem',
          width: '100%',
          position: 'relative',
          zIndex: 10000
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            새 FCM 토픽 추가
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* 토픽 이름 */}
            <div>
              <label htmlFor="topic_name" className="block text-sm font-medium text-gray-700 mb-1">
                토픽 이름 *
              </label>
              <input
                type="text"
                id="topic_name"
                name="topic_name"
                required
                value={formData.topic_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 공지사항"
              />
            </div>

            {/* 토픽 ID */}
            <div>
              <label htmlFor="topic_id" className="block text-sm font-medium text-gray-700 mb-1">
                토픽 ID *
              </label>
              <input
                type="text"
                id="topic_id"
                name="topic_id"
                required
                value={formData.topic_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: announcements"
              />
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="토픽에 대한 설명을 입력하세요"
              />
            </div>

            {/* 설정 옵션 */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                  기본 토픽으로 설정
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  활성 상태
                </label>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 