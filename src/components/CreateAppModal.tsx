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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    새 앱 추가
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="app_name" className="block text-sm font-medium text-gray-700">
                      앱 이름 *
                    </label>
                    <input
                      type="text"
                      id="app_name"
                      name="app_name"
                      required
                      value={formData.app_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="예: My Awesome App"
                    />
                  </div>

                  <div>
                    <label htmlFor="app_id" className="block text-sm font-medium text-gray-700">
                      앱 ID *
                    </label>
                    <input
                      type="text"
                      id="app_id"
                      name="app_id"
                      required
                      value={formData.app_id}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="예: com.example.myapp"
                    />
                  </div>

                  <div>
                    <label htmlFor="package_name" className="block text-sm font-medium text-gray-700">
                      패키지명 *
                    </label>
                    <input
                      type="text"
                      id="package_name"
                      name="package_name"
                      required
                      value={formData.package_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="예: com.example.myapp"
                    />
                  </div>

                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                      버전
                    </label>
                    <input
                      type="text"
                      id="version"
                      name="version"
                      value={formData.version}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="1.0.0"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      상태
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                      <option value="maintenance">점검중</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      설명
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="앱에 대한 설명을 입력하세요"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? '생성 중...' : '생성'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 