'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { AppToolbar, ToolbarButton, ApiResponse } from '@/types/database';

interface CreateToolbarRequest {
  toolbar_id: string;
  title: string;
  position: 'top' | 'bottom';
  background_color: string;
  text_color: string;
  height: number;
  is_visible: boolean;
  buttons: ToolbarButton[];
}

interface CreateToolbarModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  appId: string;
}

export default function CreateToolbarModal({ open, onClose, onCreated, appId }: CreateToolbarModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateToolbarRequest>({
    toolbar_id: 'main_toolbar',
    title: '메인 툴바',
    position: 'bottom',
    background_color: '#FFFFFF',
    text_color: '#000000',
    height: 56,
    is_visible: true,
    buttons: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/toolbars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AppToolbar> = await response.json();

      if (result.success) {
        alert('툴바가 성공적으로 생성되었습니다.');
        setFormData({
          toolbar_id: 'main_toolbar',
          title: '메인 툴바',
          position: 'bottom',
          background_color: '#FFFFFF',
          text_color: '#000000',
          height: 56,
          is_visible: true,
          buttons: [],
        });
        onCreated();
      } else {
        alert(result.error || '툴바 생성 중 오류가 발생했습니다.');
      }
    } catch {
      alert('툴바 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (name === 'height') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 56,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
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
      buttons: [...prev.buttons, newButton],
    }));
  };

  const updateButton = (index: number, field: keyof ToolbarButton, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) => 
        i === index ? { ...button, [field]: value } : button
      ),
    }));
  };

  const updateButtonTitleAndIcon = (index: number, title: string, icon: string) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) => 
        i === index ? { ...button, title, icon } : button
      ),
    }));
  };

  const updateButtonTitleIconAndAction = (index: number, title: string, icon: string, actionValue: string) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) => 
        i === index ? { ...button, title, icon, action_value: actionValue } : button
      ),
    }));
  };

  const removeButton = (index: number) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index),
    }));
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
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl transform scale-100 transition-all duration-200 ease-out max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '42rem',
          width: '100%',
          position: 'relative',
          zIndex: 10000
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            새 툴바 추가
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
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="toolbar_id" className="block text-sm font-medium text-gray-700 mb-1">
                  툴바 ID *
                </label>
                <input
                  type="text"
                  id="toolbar_id"
                  name="toolbar_id"
                  required
                  value={formData.toolbar_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="main_toolbar"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  툴바 제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="메인 툴바"
                />
              </div>
            </div>

            {/* 위치 및 스타일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  위치 *
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bottom">하단 (권장)</option>
                  <option value="top">상단</option>
                </select>
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  높이 (px)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  min="40"
                  max="200"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 색상 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="background_color" className="block text-sm font-medium text-gray-700 mb-1">
                  배경 색상
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="background_color"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleChange}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.background_color}
                    onChange={handleChange}
                    name="background_color"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="text_color" className="block text-sm font-medium text-gray-700 mb-1">
                  텍스트 색상
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="text_color"
                    name="text_color"
                    value={formData.text_color}
                    onChange={handleChange}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.text_color}
                    onChange={handleChange}
                    name="text_color"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* 표시 설정 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_visible"
                name="is_visible"
                checked={formData.is_visible}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-900">
                화면에 표시
              </label>
            </div>

            {/* 버튼 관리 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">버튼</h4>
                <button
                  type="button"
                  onClick={addButton}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  버튼 추가
                </button>
              </div>

              <div className="space-y-4">
                {formData.buttons.map((button, index) => (
                  <div key={button.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-700">버튼 {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeButton(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          버튼 타입 *
                        </label>
                        <select
                          value={`${button.title}|${button.icon}|${button.action_value}`}
                          onChange={(e) => {
                            const [title, icon, actionValue] = e.target.value.split('|');
                            updateButtonTitleIconAndAction(index, title, icon, actionValue);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="||">버튼 선택</option>
                          <option value="홈|home|/home">🏠 홈</option>
                          <option value="사용자|user|/profile">👤 사용자</option>
                          <option value="설정|settings|/settings">⚙️ 설정</option>
                          <option value="검색|search|/search">🔍 검색</option>
                          <option value="좋아요|heart|/favorites">❤️ 좋아요</option>
                          <option value="즐겨찾기|star|/bookmarks">⭐ 즐겨찾기</option>
                          <option value="알림|bell|/notifications">🔔 알림</option>
                          <option value="메뉴|menu|/menu">📋 메뉴</option>
                          <option value="추가|plus|/add">➕ 추가</option>
                          <option value="장바구니|shopping-cart|/cart">🛒 장바구니</option>
                          <option value="통계|bar-chart|/statistics">📊 통계</option>
                          <option value="기록|calendar|/records">📅 기록</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          아이콘 (자동 설정)
                        </label>
                        <input
                          type="text"
                          placeholder="자동으로 설정됩니다"
                          value={button.icon}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          액션 타입 *
                        </label>
                        <select
                          value={button.action_type}
                          onChange={(e) => updateButton(index, 'action_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="navigate">화면 이동</option>
                          <option value="external_link">외부 링크</option>
                          <option value="api_call">API 호출</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          액션 값 (자동 설정)
                        </label>
                        <input
                          type="text"
                          placeholder="자동으로 설정됩니다"
                          value={button.action_value}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
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