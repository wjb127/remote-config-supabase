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
            {/* 스타일 키 */}
            <div>
              <label htmlFor="style_key" className="block text-sm font-medium text-gray-700 mb-1">
                스타일 키 *
              </label>
              <input
                type="text"
                id="style_key"
                name="style_key"
                required
                value={formData.style_key}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: primary_color"
              />
            </div>

            {/* 스타일 값 */}
            <div>
              <label htmlFor="style_value" className="block text-sm font-medium text-gray-700 mb-1">
                스타일 값 *
              </label>
              <input
                type="text"
                id="style_value"
                name="style_value"
                required
                value={formData.style_value}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: #007AFF, 16px, bold"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="style_category" className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 *
              </label>
              <select
                id="style_category"
                name="style_category"
                value={formData.style_category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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