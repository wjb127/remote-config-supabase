'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CreateAppRequest, ApiResponse, App } from '@/types/database';

interface CreateAppModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAppModal({ open, onClose, onCreated }: CreateAppModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppRequest>({
    app_name: '',
    app_id: '',
    package_name: '',
    version: '1.0.0',
    description: '',
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<App> = await response.json();

      if (result.success) {
        alert('앱이 성공적으로 생성되었습니다.');
        setFormData({
          app_name: '',
          app_id: '',
          package_name: '',
          version: '1.0.0',
          description: '',
          status: 'active',
        });
        onCreated();
      } else {
        alert(result.error || '앱 생성 중 오류가 발생했습니다.');
      }
    } catch {
      alert('앱 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 앱 ID 변경 시 패키지명도 자동으로 동기화
    if (name === 'app_id') {
      setFormData(prev => ({
        ...prev,
        app_id: value,
        package_name: value, // 앱 ID와 패키지명 동기화
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  console.log('CreateAppModal render check - open:', open);
  
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
        className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl transform scale-100 transition-all duration-200 ease-out"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '32rem',
          width: '100%',
          position: 'relative',
          zIndex: 10000
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            새 앱 추가
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
            {/* 앱 이름 */}
            <div>
              <label htmlFor="app_name" className="block text-sm font-medium text-gray-700 mb-1">
                앱 이름 *
              </label>
              <input
                type="text"
                id="app_name"
                name="app_name"
                required
                value={formData.app_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: My Awesome App"
              />
            </div>

            {/* 앱 ID (패키지명) */}
            <div>
              <label htmlFor="app_id" className="block text-sm font-medium text-gray-700 mb-1">
                앱 ID (패키지명) *
              </label>
              <input
                type="text"
                id="app_id"
                name="app_id"
                required
                value={formData.app_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: com.example.myapp"
              />
              <p className="mt-1 text-xs text-gray-500">
                앱 ID와 패키지명이 동일하게 설정됩니다
              </p>
              
              {/* 패키지명 규칙 안내 */}
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs text-blue-800 font-medium mb-1">📱 패키지명 규칙:</div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• <strong>형식:</strong> com.회사명.앱명</div>
                  <div>• <strong>예시:</strong> com.google.gmail, com.naver.blog</div>
                  <div>• <strong>규칙:</strong> 영문 소문자, 숫자, 점(.), 언더스코어(_)만 허용</div>
                  <div>• <strong>개인:</strong> com.개발자이름.앱명 (예: com.john.calculator)</div>
                </div>
              </div>
              
              {/* 패키지명 미리보기 */}
              {formData.app_id && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">패키지명:</span> <code className="bg-gray-100 px-1 rounded">{formData.package_name}</code>
                  </div>
                  {/* 패키지명 검증 */}
                  {(() => {
                    const isValid = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(formData.app_id);
                    const hasMinSegments = formData.app_id.split('.').length >= 2;
                    
                    if (isValid && hasMinSegments) {
                      return (
                        <div className="mt-1 flex items-center text-xs text-green-700">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          올바른 패키지명 형식입니다
                        </div>
                      );
                    } else {
                      return (
                        <div className="mt-1 flex items-center text-xs text-red-700">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {!hasMinSegments ? '최소 2개 세그먼트 필요 (예: com.myapp)' : '영문 소문자로 시작하고 올바른 형식을 사용하세요'}
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            {/* 버전 */}
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                버전
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.0.0"
              />
            </div>

            {/* 상태 */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="maintenance">점검중</option>
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
                placeholder="앱에 대한 설명을 입력하세요"
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