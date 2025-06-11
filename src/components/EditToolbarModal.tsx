'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { AppToolbar, ToolbarButton, ApiResponse } from '@/types/database';

interface EditToolbarRequest {
  toolbar_id: string;
  title: string;
  position: 'top' | 'bottom';
  background_color: string;
  text_color: string;
  height: number;
  is_visible: boolean;
  buttons: ToolbarButton[];
}

interface EditToolbarModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  appId: string;
  toolbar: AppToolbar;
}

export default function EditToolbarModal({ open, onClose, onUpdated, appId, toolbar }: EditToolbarModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditToolbarRequest>({
    toolbar_id: '',
    title: '',
    position: 'top',
    background_color: '#FFFFFF',
    text_color: '#000000',
    height: 56,
    is_visible: true,
    buttons: [],
  });

  useEffect(() => {
    if (open && toolbar) {
      setFormData({
        toolbar_id: toolbar.toolbar_id,
        title: toolbar.title,
        position: toolbar.position as 'top' | 'bottom',
        background_color: toolbar.background_color,
        text_color: toolbar.text_color,
        height: toolbar.height,
        is_visible: toolbar.is_visible,
        buttons: Array.isArray(toolbar.buttons) ? toolbar.buttons : [],
      });
    }
  }, [open, toolbar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/toolbars/${toolbar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AppToolbar> = await response.json();

      if (result.success) {
        onUpdated();
      } else {
        alert(result.error || '툴바 수정 중 오류가 발생했습니다.');
      }
    } catch {
      alert('툴바 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addButton = () => {
    const newButton: ToolbarButton = {
      id: `btn_${Date.now()}`,
      title: '',
      icon: '',
      action_type: 'navigate',
      action_value: '',
      order_index: formData.buttons.length,
    };
    setFormData(prev => ({
      ...prev,
      buttons: [...prev.buttons, newButton]
    }));
  };

  const updateButton = (index: number, updates: Partial<ToolbarButton>) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) => 
        i === index ? { ...button, ...updates } : button
      )
    }));
  };

  const removeButton = (index: number) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index).map((button, i) => ({
        ...button,
        order_index: i
      }))
    }));
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">툴바 수정</h2>
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
                툴바 ID *
              </label>
              <input
                type="text"
                value={formData.toolbar_id}
                onChange={(e) => setFormData(prev => ({ ...prev, toolbar_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="main_toolbar, bottom_nav, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                툴바 제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="메인 툴바, 하단 네비게이션, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치 *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as 'top' | 'bottom' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="top">상단</option>
                <option value="bottom">하단</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                높이 (px)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 56 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="40"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                배경 색상
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                텍스트 색상
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.text_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-900">
                툴바 표시
              </label>
            </div>
          </div>

          {/* 버튼 관리 */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">툴바 버튼</h3>
              <button
                type="button"
                onClick={addButton}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                버튼 추가
              </button>
            </div>

            <div className="space-y-4">
              {formData.buttons.map((button, index) => (
                <div key={button.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">버튼 {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeButton(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        버튼 제목 *
                      </label>
                      <input
                        type="text"
                        value={button.title}
                        onChange={(e) => updateButton(index, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="홈, 검색, etc."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        아이콘
                      </label>
                      <input
                        type="text"
                        value={button.icon || ''}
                        onChange={(e) => updateButton(index, { icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="home, search, user, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        액션 타입 *
                      </label>
                      <select
                        value={button.action_type}
                        onChange={(e) => updateButton(index, { action_type: e.target.value as 'navigate' | 'external_link' | 'api_call' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="navigate">앱 내 이동</option>
                        <option value="external_link">외부 링크</option>
                        <option value="api_call">API 호출</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        액션 값 *
                      </label>
                      <input
                        type="text"
                        value={button.action_value}
                        onChange={(e) => updateButton(index, { action_value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={
                          button.action_type === 'navigate' ? '/home, /profile' :
                          button.action_type === 'external_link' ? 'https://example.com' :
                          'api/endpoint'
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.buttons.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  버튼이 없습니다. &quot;버튼 추가&quot;를 클릭하여 버튼을 추가하세요.
                </div>
              )}
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