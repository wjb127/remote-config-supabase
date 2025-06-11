'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AppFcmTopic, ApiResponse } from '@/types/database';

interface EditFcmTopicRequest {
  topic_name: string;
  topic_id: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

interface EditFcmTopicModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  appId: string;
  topic: AppFcmTopic;
}

export default function EditFcmTopicModal({ open, onClose, onUpdated, appId, topic }: EditFcmTopicModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditFcmTopicRequest>({
    topic_name: '',
    topic_id: '',
    description: '',
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    if (open && topic) {
      setFormData({
        topic_name: topic.topic_name,
        topic_id: topic.topic_id,
        description: topic.description || '',
        is_default: topic.is_default,
        is_active: topic.is_active,
      });
    }
  }, [open, topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/fcm_topics/${topic.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AppFcmTopic> = await response.json();

      if (result.success) {
        onUpdated();
      } else {
        alert(result.error || 'FCM 토픽 수정 중 오류가 발생했습니다.');
      }
    } catch {
      alert('FCM 토픽 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">FCM 토픽 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                토픽 이름 *
              </label>
              <input
                type="text"
                value={formData.topic_name}
                onChange={(e) => setFormData(prev => ({ ...prev, topic_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="전체 알림, 프로모션 알림, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                토픽 ID *
              </label>
              <input
                type="text"
                value={formData.topic_id}
                onChange={(e) => setFormData(prev => ({ ...prev, topic_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="all_notifications, promotions, etc."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="토픽에 대한 설명을 입력하세요..."
            />
          </div>

          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                기본 토픽 (자동 구독)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                활성 토픽
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 