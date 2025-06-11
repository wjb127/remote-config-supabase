'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AppStyle, ApiResponse } from '@/types/database';

interface EditStyleRequest {
  style_key: string;
  style_value: string;
  style_category: 'color' | 'typography' | 'spacing' | 'component' | 'layout';
  description?: string;
}

// 카테고리별 미리 정의된 스타일 키
const PREDEFINED_STYLE_KEYS = {
  color: [
    { key: 'primary_color', label: '기본 색상', placeholder: '#007AFF' },
    { key: 'secondary_color', label: '보조 색상', placeholder: '#34C759' },
    { key: 'background_color', label: '배경 색상', placeholder: '#FFFFFF' },
    { key: 'text_color', label: '텍스트 색상', placeholder: '#000000' },
    { key: 'accent_color', label: '강조 색상', placeholder: '#FF3B30' },
    { key: 'border_color', label: '테두리 색상', placeholder: '#E5E5E7' },
    { key: 'success_color', label: '성공 색상', placeholder: '#34C759' },
    { key: 'error_color', label: '오류 색상', placeholder: '#FF3B30' },
    { key: 'warning_color', label: '경고 색상', placeholder: '#FF9500' },
  ],
  typography: [
    { key: 'font_size_small', label: '작은 글자 크기', placeholder: '12sp' },
    { key: 'font_size_medium', label: '보통 글자 크기', placeholder: '16sp' },
    { key: 'font_size_large', label: '큰 글자 크기', placeholder: '20sp' },
    { key: 'font_size_title', label: '제목 글자 크기', placeholder: '24sp' },
    { key: 'font_family', label: '글꼴', placeholder: 'SF Pro Display' },
    { key: 'font_weight_normal', label: '일반 굵기', placeholder: 'normal' },
    { key: 'font_weight_bold', label: '굵은 글자', placeholder: 'bold' },
    { key: 'line_height', label: '줄 간격', placeholder: '1.5' },
  ],
  spacing: [
    { key: 'margin_small', label: '작은 여백', placeholder: '8dp' },
    { key: 'margin_medium', label: '보통 여백', placeholder: '16dp' },
    { key: 'margin_large', label: '큰 여백', placeholder: '24dp' },
    { key: 'padding_small', label: '작은 안쪽 여백', placeholder: '8dp' },
    { key: 'padding_medium', label: '보통 안쪽 여백', placeholder: '16dp' },
    { key: 'padding_large', label: '큰 안쪽 여백', placeholder: '24dp' },
    { key: 'gap_small', label: '작은 간격', placeholder: '4dp' },
    { key: 'gap_medium', label: '보통 간격', placeholder: '8dp' },
  ],
  component: [
    { key: 'border_radius', label: '모서리 둥글기', placeholder: '8dp' },
    { key: 'button_height', label: '버튼 높이', placeholder: '44dp' },
    { key: 'input_height', label: '입력창 높이', placeholder: '40dp' },
    { key: 'card_shadow', label: '카드 그림자', placeholder: '0px 2px 4px rgba(0,0,0,0.1)' },
    { key: 'elevation', label: '높이감', placeholder: '4dp' },
    { key: 'stroke_width', label: '선 두께', placeholder: '1dp' },
  ],
  layout: [
    { key: 'container_width', label: '컨테이너 너비', placeholder: '100%' },
    { key: 'grid_columns', label: '그리드 열 수', placeholder: '2' },
    { key: 'flex_direction', label: '플렉스 방향', placeholder: 'column' },
    { key: 'align_items', label: '아이템 정렬', placeholder: 'center' },
    { key: 'justify_content', label: '콘텐츠 정렬', placeholder: 'center' },
    { key: 'screen_padding', label: '화면 여백', placeholder: '16dp' },
  ],
};

interface EditStyleModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  appId: string;
  style: AppStyle;
}

export default function EditStyleModal({ open, onClose, onUpdated, appId, style }: EditStyleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditStyleRequest>({
    style_key: '',
    style_value: '',
    style_category: 'color',
    description: '',
  });

  useEffect(() => {
    if (open && style) {
      setFormData({
        style_key: style.style_key,
        style_value: style.style_value,
        style_category: style.style_category as 'color' | 'typography' | 'spacing' | 'component' | 'layout',
        description: style.description || '',
      });
    }
  }, [open, style]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/styles/${style.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AppStyle> = await response.json();

      if (result.success) {
        onUpdated();
      } else {
        alert(result.error || '스타일 수정 중 오류가 발생했습니다.');
      }
    } catch {
      alert('스타일 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 변경 시 스타일 키 초기화
  const handleCategoryChange = (category: 'color' | 'typography' | 'spacing' | 'component' | 'layout') => {
    setFormData(prev => ({
      ...prev,
      style_category: category,
      style_key: '',
      style_value: '',
    }));
  };

  // 스타일 키 변경 시 기본값 설정  
  const handleStyleKeyChange = (styleKey: string) => {
    const currentOptions = PREDEFINED_STYLE_KEYS[formData.style_category];
    const selectedOption = currentOptions.find(option => option.key === styleKey);
    
    setFormData(prev => ({
      ...prev,
      style_key: styleKey,
      style_value: selectedOption?.placeholder || prev.style_value,
    }));
  };

  const currentStyleOptions = PREDEFINED_STYLE_KEYS[formData.style_category];

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
          <h2 className="text-xl font-semibold text-gray-900">스타일 수정</h2>
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
                스타일 카테고리 *
              </label>
              <select
                value={formData.style_category}
                onChange={(e) => handleCategoryChange(e.target.value as 'color' | 'typography' | 'spacing' | 'component' | 'layout')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="color">색상</option>
                <option value="typography">타이포그래피</option>
                <option value="spacing">간격</option>
                <option value="component">컴포넌트</option>
                <option value="layout">레이아웃</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스타일 키 *
              </label>
              <select
                value={formData.style_key}
                onChange={(e) => handleStyleKeyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">스타일 키를 선택하세요</option>
                {currentStyleOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              스타일 값 *
            </label>
            {formData.style_category === 'color' ? (
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.style_value.startsWith('#') ? formData.style_value : '#000000'}
                  onChange={(e) => setFormData(prev => ({ ...prev, style_value: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.style_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, style_value: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#007AFF"
                  required
                />
              </div>
            ) : (
              <input
                type="text"
                value={formData.style_value}
                onChange={(e) => setFormData(prev => ({ ...prev, style_value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  currentStyleOptions.find(opt => opt.key === formData.style_key)?.placeholder || 
                  "스타일 값을 입력하세요"
                }
                required
              />
            )}
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
              placeholder="스타일에 대한 설명을 입력하세요..."
            />
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