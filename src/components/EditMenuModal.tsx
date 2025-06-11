'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Menu, ApiResponse } from '@/types/database';

interface EditMenuRequest {
  menu_id: string;
  title: string;
  icon?: string;
  order_index: number;
  parent_id?: string;
  menu_type: 'item' | 'category' | 'divider';
  action_type?: 'navigate' | 'external_link' | 'api_call';
  action_value?: string;
  is_visible: boolean;
  is_enabled: boolean;
}



interface EditMenuModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  appId: string;
  menu: Menu;
  menus: Menu[];
}

export default function EditMenuModal({ open, onClose, onUpdated, appId, menu, menus }: EditMenuModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditMenuRequest>({
    menu_id: '',
    title: '',
    icon: '',
    order_index: 0,
    parent_id: '',
    menu_type: 'item',
    action_type: 'navigate',
    action_value: '',
    is_visible: true,
    is_enabled: true,
  });

  useEffect(() => {
    if (open && menu) {
      setFormData({
        menu_id: menu.menu_id,
        title: menu.title,
        icon: menu.icon || '',
        order_index: menu.order_index,
        parent_id: menu.parent_id || '',
        menu_type: menu.menu_type as 'item' | 'category' | 'divider',
        action_type: menu.action_type as 'navigate' | 'external_link' | 'api_call' || 'navigate',
        action_value: menu.action_value || '',
        is_visible: menu.is_visible,
        is_enabled: menu.is_enabled,
      });
    }
  }, [open, menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/menus/${menu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id || null,
          action_type: formData.menu_type === 'divider' ? null : formData.action_type,
          action_value: formData.menu_type === 'divider' ? null : formData.action_value,
        }),
      });

      const result: ApiResponse<Menu> = await response.json();

      if (result.success) {
        onUpdated();
      } else {
        alert(result.error || '메뉴 수정 중 오류가 발생했습니다.');
      }
    } catch {
      alert('메뉴 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 부모 메뉴 옵션 (자기 자신과 자기 하위 메뉴는 제외)
  const parentMenuOptions = menus.filter(m => 
    m.id !== menu.id && 
    m.menu_type === 'category' && 
    m.parent_id !== menu.id
  );

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
          <h2 className="text-xl font-semibold text-gray-900">메뉴 수정</h2>
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
                메뉴 ID *
              </label>
              <input
                type="text"
                value={formData.menu_id}
                onChange={(e) => setFormData(prev => ({ ...prev, menu_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="home, categories, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메뉴 제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="홈, 카테고리, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이콘
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="home, user, settings, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                순서
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상위 메뉴
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">최상위 메뉴</option>
                {parentMenuOptions.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메뉴 타입 *
              </label>
              <select
                value={formData.menu_type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  menu_type: e.target.value as 'item' | 'category' | 'divider',
                  action_type: e.target.value === 'divider' ? undefined : prev.action_type,
                  action_value: e.target.value === 'divider' ? '' : prev.action_value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="item">항목</option>
                <option value="category">카테고리</option>
                <option value="divider">구분선</option>
              </select>
            </div>
          </div>

          {formData.menu_type !== 'divider' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  액션 타입
                </label>
                <select
                  value={formData.action_type || 'navigate'}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    action_type: e.target.value as 'navigate' | 'external_link' | 'api_call'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="navigate">앱 내 이동</option>
                  <option value="external_link">외부 링크</option>
                  <option value="api_call">API 호출</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  액션 값
                </label>
                <input
                  type="text"
                  value={formData.action_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, action_value: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    formData.action_type === 'navigate' ? '/home, /profile' :
                    formData.action_type === 'external_link' ? 'https://example.com' :
                    'api/endpoint'
                  }
                />
              </div>
            </div>
          )}

          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-900">
                표시
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_enabled"
                checked={formData.is_enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, is_enabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-900">
                활성화
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