'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Menu, ApiResponse } from '@/types/database';

interface CreateMenuRequest {
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

// 메뉴 템플릿 타입 정의
interface MenuTemplate {
  id: string;
  title: string;
  icon: string;
  action_type: 'navigate' | 'external_link' | 'api_call' | '';
  action_value: string;
  type?: string;
}

// 메뉴 타입별 미리 정의된 템플릿
const MENU_TEMPLATES: Record<string, MenuTemplate[]> = {
  navigation: [
    { id: 'home', title: '홈', icon: 'home', action_type: 'navigate', action_value: '/home' },
    { id: 'profile', title: '내 정보', icon: 'user', action_type: 'navigate', action_value: '/profile' },
    { id: 'settings', title: '설정', icon: 'settings', action_type: 'navigate', action_value: '/settings' },
    { id: 'notifications', title: '알림', icon: 'bell', action_type: 'navigate', action_value: '/notifications' },
    { id: 'search', title: '검색', icon: 'search', action_type: 'navigate', action_value: '/search' },
    { id: 'favorites', title: '즐겨찾기', icon: 'heart', action_type: 'navigate', action_value: '/favorites' },
    { id: 'history', title: '이용내역', icon: 'clock', action_type: 'navigate', action_value: '/history' },
    { id: 'help', title: '도움말', icon: 'help-circle', action_type: 'navigate', action_value: '/help' },
  ],
  commerce: [
    { id: 'products', title: '상품', icon: 'package', action_type: 'navigate', action_value: '/products' },
    { id: 'cart', title: '장바구니', icon: 'shopping-cart', action_type: 'navigate', action_value: '/cart' },
    { id: 'orders', title: '주문내역', icon: 'list', action_type: 'navigate', action_value: '/orders' },
    { id: 'wishlist', title: '위시리스트', icon: 'heart', action_type: 'navigate', action_value: '/wishlist' },
    { id: 'categories', title: '카테고리', icon: 'grid', action_type: 'navigate', action_value: '/categories' },
    { id: 'brands', title: '브랜드', icon: 'tag', action_type: 'navigate', action_value: '/brands' },
    { id: 'deals', title: '특가', icon: 'zap', action_type: 'navigate', action_value: '/deals' },
    { id: 'reviews', title: '리뷰', icon: 'star', action_type: 'navigate', action_value: '/reviews' },
  ],
  content: [
    { id: 'news', title: '뉴스', icon: 'newspaper', action_type: 'navigate', action_value: '/news' },
    { id: 'articles', title: '게시글', icon: 'file-text', action_type: 'navigate', action_value: '/articles' },
    { id: 'videos', title: '동영상', icon: 'play', action_type: 'navigate', action_value: '/videos' },
    { id: 'photos', title: '사진', icon: 'image', action_type: 'navigate', action_value: '/photos' },
    { id: 'events', title: '이벤트', icon: 'calendar', action_type: 'navigate', action_value: '/events' },
    { id: 'community', title: '커뮤니티', icon: 'users', action_type: 'navigate', action_value: '/community' },
    { id: 'faq', title: 'FAQ', icon: 'help-circle', action_type: 'navigate', action_value: '/faq' },
    { id: 'contact', title: '문의하기', icon: 'mail', action_type: 'navigate', action_value: '/contact' },
  ],
  social: [
    { id: 'feed', title: '피드', icon: 'rss', action_type: 'navigate', action_value: '/feed' },
    { id: 'friends', title: '친구', icon: 'users', action_type: 'navigate', action_value: '/friends' },
    { id: 'messages', title: '메시지', icon: 'message-circle', action_type: 'navigate', action_value: '/messages' },
    { id: 'groups', title: '그룹', icon: 'users', action_type: 'navigate', action_value: '/groups' },
    { id: 'chat', title: '채팅', icon: 'message-square', action_type: 'navigate', action_value: '/chat' },
    { id: 'live', title: '라이브', icon: 'video', action_type: 'navigate', action_value: '/live' },
    { id: 'stories', title: '스토리', icon: 'camera', action_type: 'navigate', action_value: '/stories' },
    { id: 'trending', title: '트렌딩', icon: 'trending-up', action_type: 'navigate', action_value: '/trending' },
  ],
  utilities: [
    { id: 'divider1', title: '구분선 1', icon: '', action_type: '', action_value: '', type: 'divider' },
    { id: 'divider2', title: '구분선 2', icon: '', action_type: '', action_value: '', type: 'divider' },
    { id: 'spacer', title: '여백', icon: '', action_type: '', action_value: '', type: 'divider' },
    { id: 'custom', title: '사용자 정의', icon: 'plus', action_type: 'navigate', action_value: '/custom' },
  ],
};

interface CreateMenuModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  appId: string;
  menus: Menu[];
}

export default function CreateMenuModal({ open, onClose, onCreated, appId, menus }: CreateMenuModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('navigation');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [formData, setFormData] = useState<CreateMenuRequest>({
    menu_id: '',
    title: '',
    icon: '',
    order_index: menus.length,
    parent_id: '',
    menu_type: 'item',
    action_type: 'navigate',
    action_value: '',
    is_visible: true,
    is_enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apps/${appId}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id || null,
        }),
      });

      const result: ApiResponse<Menu> = await response.json();

      if (result.success) {
        alert('메뉴가 성공적으로 생성되었습니다.');
        setFormData({
          menu_id: '',
          title: '',
          icon: '',
          order_index: menus.length,
          parent_id: '',
          menu_type: 'item',
          action_type: 'navigate',
          action_value: '',
          is_visible: true,
          is_enabled: true,
        });
        onCreated();
      } else {
        alert(result.error || '메뉴 생성 중 오류가 발생했습니다.');
      }
    } catch {
      alert('메뉴 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (name === 'order_index') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedTemplate('');
    setIsCustomMode(false);
  };

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === 'custom') {
      setIsCustomMode(true);
      return;
    }

    const template = MENU_TEMPLATES[selectedCategory]?.find((t: MenuTemplate) => t.id === templateId);
    if (template) {
              setFormData(prev => ({
          ...prev,
          menu_id: template.id,
          title: template.title,
          icon: template.icon,
          menu_type: template.type === 'divider' ? 'divider' : 'item',
          action_type: template.type === 'divider' ? undefined : (template.action_type as 'navigate' | 'external_link' | 'api_call'),
          action_value: template.type === 'divider' ? '' : template.action_value,
        }));
      setIsCustomMode(false);
    }
  };

  const currentTemplates = MENU_TEMPLATES[selectedCategory] || [];

  if (!open) return null;

  const parentMenus = menus.filter(menu => menu.menu_type === 'category');

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
        className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl transform scale-100 transition-all duration-200 ease-out max-h-[90vh] overflow-y-auto"
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
            새 메뉴 추가
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
            {/* 메뉴 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메뉴 카테고리 *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="navigation">네비게이션</option>
                <option value="commerce">커머스</option>
                <option value="content">콘텐츠</option>
                <option value="social">소셜</option>
                <option value="utilities">유틸리티</option>
              </select>
            </div>

            {/* 메뉴 템플릿 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메뉴 템플릿 *
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">템플릿을 선택하세요</option>
                {currentTemplates.map((template: MenuTemplate) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
                <option value="custom">사용자 정의</option>
              </select>
            </div>

            {(selectedTemplate && selectedTemplate !== 'custom') || isCustomMode ? (
              <>
                {/* 메뉴 ID */}
                <div>
                  <label htmlFor="menu_id" className="block text-sm font-medium text-gray-700 mb-1">
                    메뉴 ID *
                  </label>
                  <input
                    type="text"
                    id="menu_id"
                    name="menu_id"
                    required
                    value={formData.menu_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: home, profile, settings"
                  />
                </div>

                {/* 메뉴 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    메뉴 제목 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 홈, 프로필, 설정"
                  />
                </div>
              </>
            ) : null}

            {/* 아이콘 */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                아이콘
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: home, user, settings"
              />
            </div>

            {/* 순서 */}
            <div>
              <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-1">
                순서
              </label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                min="0"
                value={formData.order_index}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 상위 메뉴 */}
            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                상위 메뉴
              </label>
              <select
                id="parent_id"
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">최상위 메뉴</option>
                {parentMenus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 메뉴 타입 */}
            <div>
              <label htmlFor="menu_type" className="block text-sm font-medium text-gray-700 mb-1">
                메뉴 타입 *
              </label>
              <select
                id="menu_type"
                name="menu_type"
                value={formData.menu_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="item">메뉴 항목</option>
                <option value="category">카테고리</option>
                <option value="divider">구분선</option>
              </select>
            </div>

            {/* 액션 타입 */}
            {formData.menu_type === 'item' && (
              <div>
                <label htmlFor="action_type" className="block text-sm font-medium text-gray-700 mb-1">
                  액션 타입
                </label>
                <select
                  id="action_type"
                  name="action_type"
                  value={formData.action_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="navigate">화면 이동</option>
                  <option value="external_link">외부 링크</option>
                  <option value="api_call">API 호출</option>
                </select>
              </div>
            )}

            {/* 액션 값 */}
            {formData.menu_type === 'item' && formData.action_type && (
              <div>
                <label htmlFor="action_value" className="block text-sm font-medium text-gray-700 mb-1">
                  액션 값
                </label>
                <input
                  type="text"
                  id="action_value"
                  name="action_value"
                  value={formData.action_value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    formData.action_type === 'navigate' ? '예: /home, /profile' :
                    formData.action_type === 'external_link' ? '예: https://example.com' :
                    '예: /api/some-action'
                  }
                />
              </div>
            )}

            {/* 설정 옵션 */}
            <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_enabled"
                  name="is_enabled"
                  checked={formData.is_enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-900">
                  사용 가능
                </label>
              </div>
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