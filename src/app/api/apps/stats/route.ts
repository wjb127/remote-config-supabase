import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types/database';

interface GlobalStats {
  apps: {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
  };
  menus: {
    total: number;
    averagePerApp: number;
  };
  toolbars: {
    total: number;
    averagePerApp: number;
  };
  fcm_topics: {
    total: number;
    averagePerApp: number;
  };
  styles: {
    total: number;
    averagePerApp: number;
    topCategories: Array<{ category: string; count: number }>;
  };
  lastUpdated: string;
}

// GET /api/apps/stats - 전체 앱 통계 조회
export async function GET() {
  try {
    // 병렬로 모든 통계 조회
    const [
      { data: apps, error: appsError },
      { data: menus, error: menusError },
      { data: toolbars, error: toolbarsError },
      { data: fcmTopics, error: fcmTopicsError },
      { data: styles, error: stylesError }
    ] = await Promise.all([
      supabaseAdmin.from('app').select('status'),
      supabaseAdmin.from('menu').select('app_id'),
      supabaseAdmin.from('app_toolbar').select('app_id'),
      supabaseAdmin.from('app_fcm_topic').select('app_id'),
      supabaseAdmin.from('app_style').select('app_id, style_category')
    ]);

    if (appsError || menusError || toolbarsError || fcmTopicsError || stylesError) {
      return NextResponse.json<ApiResponse<GlobalStats>>({
        success: false,
        error: '통계 조회 중 오류가 발생했습니다.',
      }, { status: 500 });
    }

    const totalApps = apps?.length || 0;

    // 앱 상태별 통계
    const appStats = {
      total: totalApps,
      active: apps?.filter(app => app.status === 'active').length || 0,
      inactive: apps?.filter(app => app.status === 'inactive').length || 0,
      maintenance: apps?.filter(app => app.status === 'maintenance').length || 0,
    };

    // 메뉴 통계
    const menuStats = {
      total: menus?.length || 0,
      averagePerApp: totalApps > 0 ? Math.round(((menus?.length || 0) / totalApps) * 10) / 10 : 0,
    };

    // 툴바 통계
    const toolbarStats = {
      total: toolbars?.length || 0,
      averagePerApp: totalApps > 0 ? Math.round(((toolbars?.length || 0) / totalApps) * 10) / 10 : 0,
    };

    // FCM 토픽 통계
    const fcmTopicStats = {
      total: fcmTopics?.length || 0,
      averagePerApp: totalApps > 0 ? Math.round(((fcmTopics?.length || 0) / totalApps) * 10) / 10 : 0,
    };

    // 스타일 통계
    const styleCategoryCount: Record<string, number> = {};
    styles?.forEach(style => {
      const category = style.style_category || 'uncategorized';
      styleCategoryCount[category] = (styleCategoryCount[category] || 0) + 1;
    });

    const topCategories = Object.entries(styleCategoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const styleStats = {
      total: styles?.length || 0,
      averagePerApp: totalApps > 0 ? Math.round(((styles?.length || 0) / totalApps) * 10) / 10 : 0,
      topCategories,
    };

    const stats: GlobalStats = {
      apps: appStats,
      menus: menuStats,
      toolbars: toolbarStats,
      fcm_topics: fcmTopicStats,
      styles: styleStats,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<GlobalStats>>({
      success: true,
      data: stats,
    });
  } catch {
    return NextResponse.json<ApiResponse<GlobalStats>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 