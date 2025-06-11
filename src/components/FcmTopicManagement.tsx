'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { App, AppFcmTopic, ApiResponse } from '@/types/database';
import CreateFcmTopicModal from '@/components/CreateFcmTopicModal';
import EditFcmTopicModal from '@/components/EditFcmTopicModal';

interface FcmTopicManagementProps {
  app: App;
}

export default function FcmTopicManagement({ app }: FcmTopicManagementProps) {
  const [topics, setTopics] = useState<AppFcmTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<AppFcmTopic | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetch(`/api/apps/${app.id}/fcm_topics`);
      const result: ApiResponse<AppFcmTopic[]> = await response.json();
      if (result.success && result.data) {
        setTopics(result.data);
      }
    } catch (error) {
      console.error('FCM 토픽 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [app.id]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleTopicCreated = () => {
    fetchTopics();
    setIsCreateModalOpen(false);
  };

  const handleEditTopic = (topic: AppFcmTopic) => {
    setEditingTopic(topic);
    setIsEditModalOpen(true);
  };

  const handleTopicUpdated = () => {
    fetchTopics();
    setIsEditModalOpen(false);
    setEditingTopic(null);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('이 FCM 토픽을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/apps/${app.id}/fcm_topics/${topicId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        alert('FCM 토픽이 성공적으로 삭제되었습니다.');
        fetchTopics();
      } else {
        alert(result.error || 'FCM 토픽 삭제 중 오류가 발생했습니다.');
      }
    } catch {
      alert('FCM 토픽 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            FCM 토픽 관리
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            토픽 추가
          </button>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">FCM 토픽이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              새 FCM 토픽을 추가하여 시작하세요.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                토픽 추가
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    토픽 이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    토픽 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {topic.topic_name}
                          </div>
                          {topic.is_default && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              기본 토픽
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {topic.topic_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {topic.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        topic.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {topic.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditTopic(topic)}
                          className="text-blue-600 hover:text-blue-900"
                          title="편집"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create FCM Topic Modal */}
        <CreateFcmTopicModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleTopicCreated}
          appId={app.id}
        />

        {/* Edit FCM Topic Modal */}
        {editingTopic && (
          <EditFcmTopicModal
            open={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingTopic(null);
            }}
            onUpdated={handleTopicUpdated}
            appId={app.id}
            topic={editingTopic}
          />
        )}
      </div>
    </div>
  );
} 