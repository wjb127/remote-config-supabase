'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';
import { App, AppStyle, ApiResponse } from '@/types/database';
import CreateStyleModal from '@/components/CreateStyleModal';
import EditStyleModal from '@/components/EditStyleModal';

interface StyleManagementProps {
  app: App;
}

export default function StyleManagement({ app }: StyleManagementProps) {
  const [styles, setStyles] = useState<AppStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<AppStyle | null>(null);

  const fetchStyles = useCallback(async () => {
    try {
      const response = await fetch(`/api/apps/${app.id}/styles`);
      const result: ApiResponse<AppStyle[]> = await response.json();
      if (result.success && result.data) {
        setStyles(result.data);
      }
    } catch (error) {
      console.error('스타일 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [app.id]);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  const handleStyleCreated = () => {
    fetchStyles();
    setIsCreateModalOpen(false);
  };

  const handleEditStyle = (style: AppStyle) => {
    setEditingStyle(style);
    setIsEditModalOpen(true);
  };

  const handleStyleUpdated = () => {
    fetchStyles();
    setIsEditModalOpen(false);
    setEditingStyle(null);
  };

  const handleDeleteStyle = async (styleId: string) => {
    if (!confirm('이 스타일을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/apps/${app.id}/styles/${styleId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        alert('스타일이 성공적으로 삭제되었습니다.');
        fetchStyles();
      } else {
        alert(result.error || '스타일 삭제 중 오류가 발생했습니다.');
      }
    } catch {
      alert('스타일 삭제 중 오류가 발생했습니다.');
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'color': return 'bg-red-100 text-red-800';
      case 'typography': return 'bg-blue-100 text-blue-800';
      case 'spacing': return 'bg-green-100 text-green-800';
      case 'component': return 'bg-yellow-100 text-yellow-800';
      case 'layout': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'color': return '색상';
      case 'typography': return '타이포그래피';
      case 'spacing': return '간격';
      case 'component': return '컴포넌트';
      case 'layout': return '레이아웃';
      default: return category;
    }
  };

  const renderStylePreview = (style: AppStyle) => {
    if (style.style_category === 'color' && style.style_value.startsWith('#')) {
      return (
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: style.style_value }}
          />
          <span className="text-xs text-gray-600">{style.style_value}</span>
        </div>
      );
    }
    
    return (
      <span className="text-xs text-gray-600 truncate max-w-xs">
        {style.style_value}
      </span>
    );
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
            스타일 관리
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            스타일 추가
          </button>
        </div>

        {styles.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">스타일이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              새 스타일을 추가하여 시작하세요.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                스타일 추가
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    스타일 키
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    값
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {styles.map((style) => (
                  <tr key={style.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {style.style_key}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStylePreview(style)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(style.style_category)}`}>
                        {getCategoryLabel(style.style_category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {style.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditStyle(style)}
                          className="text-blue-600 hover:text-blue-900"
                          title="편집"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStyle(style.id)}
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

        {/* Create Style Modal */}
        <CreateStyleModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleStyleCreated}
          appId={app.id}
        />

        {/* Edit Style Modal */}
        {editingStyle && (
          <EditStyleModal
            open={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingStyle(null);
            }}
            onUpdated={handleStyleUpdated}
            appId={app.id}
            style={editingStyle}
          />
        )}
      </div>
    </div>
  );
} 