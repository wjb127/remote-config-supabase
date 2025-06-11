import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types/database';

interface AppStats {
  menus: {
    total: number;
    visible: number;
    enabled: number;
    categories: number;
    items: number;
    dividers: number;
  };
  toolbars: {
    total: number;
    visible: number;
  };
  fcm_topics: {
    total: number;
    active: number;
    default: number;
  };
  styles: {
    total: number;
    categories: Record<string, number>;
  };
}

// GET /api/apps/[id]/stats - 앱 통계 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 병렬로 모든 데이터 조회
    const [
      { data: menus, error: menusError },
      { data: toolbars, error: toolbarsError },
      { data: fcmTopics, error: fcmTopicsError },
      { data: styles, error: stylesError }
    ] = await Promise.all([
      supabaseAdmin.from('menu').select('*').eq('app_id', id),
      supabaseAdmin.from('app_toolbar').select('*').eq('app_id', id),
      supabaseAdmin.from('app_fcm_topic').select('*').eq('app_id', id),
      supabaseAdmin.from('app_style').select('*').eq('app_id', id)
    ]);

    if (menusError || toolbarsError || fcmTopicsError || stylesError) {
      return NextResponse.json<ApiResponse<AppStats>>({
        success: false,
        error: '통계 조회 중 오류가 발생했습니다.',
      }, { status: 500 });
    }

    // 통계 계산
    const menuStats = {
      total: menus?.length || 0,
      visible: menus?.filter(m => m.is_visible).length || 0,
      enabled: menus?.filter(m => m.is_enabled).length || 0,
      categories: menus?.filter(m => m.menu_type === 'category').length || 0,
      items: menus?.filter(m => m.menu_type === 'item').length || 0,
      dividers: menus?.filter(m => m.menu_type === 'divider').length || 0,
    };

    const toolbarStats = {
      total: toolbars?.length || 0,
      visible: toolbars?.filter(t => t.is_visible).length || 0,
    };

    const fcmTopicStats = {
      total: fcmTopics?.length || 0,
      active: fcmTopics?.filter(f => f.is_active).length || 0,
      default: fcmTopics?.filter(f => f.is_default).length || 0,
    };

    // 스타일 카테고리별 통계
    const styleCategories: Record<string, number> = {};
    styles?.forEach(style => {
      const category = style.style_category || 'uncategorized';
      styleCategories[category] = (styleCategories[category] || 0) + 1;
    });

    const styleStats = {
      total: styles?.length || 0,
      categories: styleCategories,
    };

    const stats: AppStats = {
      menus: menuStats,
      toolbars: toolbarStats,
      fcm_topics: fcmTopicStats,
      styles: styleStats,
    };

    return NextResponse.json<ApiResponse<AppStats>>({
      success: true,
      data: stats,
    });
  } catch {
    return NextResponse.json<ApiResponse<AppStats>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 