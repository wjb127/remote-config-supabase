'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Wrench } from 'lucide-react';
import { App, AppToolbar, ApiResponse } from '@/types/database';
import CreateToolbarModal from '@/components/CreateToolbarModal';
import EditToolbarModal from '@/components/EditToolbarModal';

interface ToolbarManagementProps {
  app: App;
}

export default function ToolbarManagement({ app }: ToolbarManagementProps) {
  const [toolbars, setToolbars] = useState<AppToolbar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingToolbar, setEditingToolbar] = useState<AppToolbar | null>(null);

  const fetchToolbars = useCallback(async () => {
    try {
      const response = await fetch(`/api/apps/${app.id}/toolbars`);
      const result: ApiResponse<AppToolbar[]> = await response.json();
      if (result.success && result.data) {
        setToolbars(result.data);
      }
    } catch (error) {
      console.error('툴바 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [app.id]);

  useEffect(() => {
    fetchToolbars();
  }, [fetchToolbars]);

  const handleToolbarCreated = () => {
    fetchToolbars();
    setIsCreateModalOpen(false);
  };

  const handleEditToolbar = (toolbar: AppToolbar) => {
    setEditingToolbar(toolbar);
    setIsEditModalOpen(true);
  };

  const handleToolbarUpdated = () => {
    fetchToolbars();
    setIsEditModalOpen(false);
    setEditingToolbar(null);
  };

  const handleDeleteToolbar = async (toolbarId: string) => {
    if (!confirm('이 툴바를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/apps/${app.id}/toolbars/${toolbarId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        alert('툴바가 성공적으로 삭제되었습니다.');
        fetchToolbars();
      } else {
        alert(result.error || '툴바 삭제 중 오류가 발생했습니다.');
      }
    } catch {
      alert('툴바 삭제 중 오류가 발생했습니다.');
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
            툴바 관리
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            툴바 추가
          </button>
        </div>

        {toolbars.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">툴바가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              새 툴바를 추가하여 시작하세요.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                툴바 추가
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolbars.map((toolbar) => (
              <div key={toolbar.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {toolbar.title}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      {toolbar.toolbar_id}
                    </p>
                    
                    {/* 툴바 미리보기 */}
                    <div 
                      className="mb-4 p-3 rounded border"
                      style={{
                        backgroundColor: toolbar.background_color,
                        color: toolbar.text_color,
                        height: `${Math.min(toolbar.height, 60)}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}
                    >
                      미리보기 ({toolbar.position})
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">위치:</span>
                        <span className="font-medium">
                          {toolbar.position === 'top' ? '상단' : '하단'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">높이:</span>
                        <span className="font-medium">{toolbar.height}px</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">버튼 수:</span>
                        <span className="font-medium">{toolbar.buttons.length}개</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">상태:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          toolbar.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {toolbar.is_visible ? '표시' : '숨김'}
                        </span>
                      </div>
                    </div>

                    {/* 버튼 목록 */}
                    {toolbar.buttons.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">버튼:</h5>
                        <div className="space-y-1">
                          {toolbar.buttons.slice(0, 3).map((button, index) => (
                            <div key={button.id} className="text-xs text-gray-600 truncate">
                              {index + 1}. {button.title} ({button.action_type})
                            </div>
                          ))}
                          {toolbar.buttons.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{toolbar.buttons.length - 3}개 더
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button 
                      onClick={() => handleEditToolbar(toolbar)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="편집"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteToolbar(toolbar.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Toolbar Modal */}
        <CreateToolbarModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleToolbarCreated}
          appId={app.id}
        />

        {/* Edit Toolbar Modal */}
        {editingToolbar && (
          <EditToolbarModal
            open={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingToolbar(null);
            }}
            onUpdated={handleToolbarUpdated}
            appId={app.id}
            toolbar={editingToolbar}
          />
        )}
      </div>
    </div>
  );
} 