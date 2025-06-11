'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Menu as MenuIcon } from 'lucide-react';
import { App, Menu, ApiResponse } from '@/types/database';
import CreateMenuModal from '@/components/CreateMenuModal';

interface MenuManagementProps {
  app: App;
}

export default function MenuManagement({ app }: MenuManagementProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      const response = await fetch(`/api/apps/${app.id}/menus`);
      const result: ApiResponse<Menu[]> = await response.json();
      if (result.success && result.data) {
        setMenus(result.data);
      }
    } catch (error) {
      console.error('메뉴 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [app.id]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleMenuCreated = () => {
    fetchMenus();
    setIsCreateModalOpen(false);
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/apps/${app.id}/menus/${menuId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        alert('메뉴가 성공적으로 삭제되었습니다.');
        fetchMenus();
      } else {
        alert(result.error || '메뉴 삭제 중 오류가 발생했습니다.');
      }
    } catch {
      alert('메뉴 삭제 중 오류가 발생했습니다.');
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
            메뉴 관리
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            메뉴 추가
          </button>
        </div>

        {menus.length === 0 ? (
          <div className="text-center py-12">
            <MenuIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">메뉴가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              새 메뉴를 추가하여 시작하세요.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                메뉴 추가
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메뉴 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    순서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">액션</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menus.map((menu) => {
                  const parentMenu = menu.parent_id ? menus.find(m => m.id === menu.parent_id) : null;
                  return (
                    <tr key={menu.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {menu.parent_id && (
                            <div className="text-gray-400 mr-2">↳</div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {menu.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {menu.menu_id}
                              {parentMenu && (
                                <span className="text-xs text-gray-400 ml-2">
                                  ({parentMenu.title} 하위)
                                </span>
                              )}
                            </div>
                            {menu.icon && (
                              <div className="text-xs text-blue-600 mt-1">
                                아이콘: {menu.icon}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {menu.menu_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {menu.order_index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          menu.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {menu.is_visible ? '표시' : '숨김'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          menu.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {menu.is_enabled ? '활성' : '비활성'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="편집"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Menu Modal */}
        <CreateMenuModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleMenuCreated}
          appId={app.id}
          menus={menus}
        />
      </div>
    </div>
  );
} 