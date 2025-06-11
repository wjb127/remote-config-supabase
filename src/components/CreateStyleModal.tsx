'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { AppStyle, ApiResponse } from '@/types/database';

interface CreateStyleRequest {
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

interface CreateStyleModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  appId: string;
}

export default function CreateStyleModal({ open, onClose, onCreated, appId }: CreateStyleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStyleRequest>({
    style_key: '',
    style_value: '',
    style_category: 'color',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/styles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AppStyle> = await response.json();

      if (result.success) {
        alert('스타일이 성공적으로 생성되었습니다.');
        setFormData({
          style_key: '',
          style_value: '',
          style_category: 'color',
          description: '',
        });
        onCreated();
      } else {
        alert(result.error || '스타일 생성 중 오류가 발생했습니다.');
      }
    } catch {
      alert('스타일 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
      style_value: selectedOption?.placeholder || '',
    }));
  };

  const currentStyleOptions = PREDEFINED_STYLE_KEYS[formData.style_category];

  if (!open) return null;

  const categoryOptions = [
    { value: 'color', label: '색상' },
    { value: 'typography', label: '타이포그래피' },
    { value: 'spacing', label: '간격' },
    { value: 'component', label: '컴포넌트' },
    { value: 'layout', label: '레이아웃' },
  ];

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
            새 스타일 추가
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
            {/* 카테고리 */}
            <div>
              <label htmlFor="style_category" className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 *
              </label>
              <select
                id="style_category"
                name="style_category"
                value={formData.style_category}
                onChange={(e) => handleCategoryChange(e.target.value as 'color' | 'typography' | 'spacing' | 'component' | 'layout')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 스타일 키 */}
            <div>
              <label htmlFor="style_key" className="block text-sm font-medium text-gray-700 mb-1">
                스타일 키 *
              </label>
              <select
                id="style_key"
                name="style_key"
                required
                value={formData.style_key}
                onChange={(e) => handleStyleKeyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">스타일 키를 선택하세요</option>
                {currentStyleOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 스타일 값 */}
            <div>
              <label htmlFor="style_value" className="block text-sm font-medium text-gray-700 mb-1">
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
                    id="style_value"
                    name="style_value"
                    required
                    value={formData.style_value}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#007AFF"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  id="style_value"
                  name="style_value"
                  required
                  value={formData.style_value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    currentStyleOptions.find(opt => opt.key === formData.style_key)?.placeholder || 
                    "스타일 값을 입력하세요"
                  }
                />
              )}
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
                placeholder="스타일에 대한 설명을 입력하세요"
              />
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