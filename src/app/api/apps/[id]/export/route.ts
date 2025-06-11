import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types/database';

interface AppExport {
  app: {
    app_name: string;
    app_id: string;
    package_name: string;
    version: string;
    description?: string;
    status: string;
  };
  menus: Array<{
    menu_id: string;
    title: string;
    icon?: string;
    order_index: number;
    parent_id?: string;
    menu_type: string;
    action_type?: string;
    action_value?: string;
    is_visible: boolean;
    is_enabled: boolean;
  }>;
  toolbars: Array<{
    toolbar_id: string;
    title: string;
    position: string;
    background_color: string;
    text_color: string;
    height: number;
    is_visible: boolean;
    buttons: Record<string, unknown>[];
  }>;
  fcm_topics: Array<{
    topic_name: string;
    topic_id: string;
    description?: string;
    is_default: boolean;
    is_active: boolean;
  }>;
  styles: Array<{
    style_key: string;
    style_value: string;
    style_category: string;
    description?: string;
  }>;
  exported_at: string;
  version: '1.0';
}

// GET /api/apps/[id]/export - 앱 설정 내보내기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 앱과 모든 설정 조회
    const [
      { data: app, error: appError },
      { data: menus, error: menusError },
      { data: toolbars, error: toolbarsError },
      { data: fcmTopics, error: fcmTopicsError },
      { data: styles, error: stylesError }
    ] = await Promise.all([
      supabaseAdmin.from('app').select('*').eq('id', id).single(),
      supabaseAdmin.from('menu').select('*').eq('app_id', id).order('order_index'),
      supabaseAdmin.from('app_toolbar').select('*').eq('app_id', id),
      supabaseAdmin.from('app_fcm_topic').select('*').eq('app_id', id),
      supabaseAdmin.from('app_style').select('*').eq('app_id', id)
    ]);

    if (appError || !app) {
      return NextResponse.json<ApiResponse<AppExport>>({
        success: false,
        error: '앱을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    if (menusError || toolbarsError || fcmTopicsError || stylesError) {
      return NextResponse.json<ApiResponse<AppExport>>({
        success: false,
        error: '앱 설정 조회 중 오류가 발생했습니다.',
      }, { status: 500 });
    }

    // 내보내기 데이터 구성 (ID 필드 제외)
    const exportData: AppExport = {
      app: {
        app_name: app.app_name,
        app_id: app.app_id,
        package_name: app.package_name,
        version: app.version,
        description: app.description,
        status: app.status,
      },
      menus: menus?.map(menu => ({
        menu_id: menu.menu_id,
        title: menu.title,
        icon: menu.icon,
        order_index: menu.order_index,
        parent_id: menu.parent_id,
        menu_type: menu.menu_type,
        action_type: menu.action_type,
        action_value: menu.action_value,
        is_visible: menu.is_visible,
        is_enabled: menu.is_enabled,
      })) || [],
      toolbars: toolbars?.map(toolbar => ({
        toolbar_id: toolbar.toolbar_id,
        title: toolbar.title,
        position: toolbar.position,
        background_color: toolbar.background_color,
        text_color: toolbar.text_color,
        height: toolbar.height,
        is_visible: toolbar.is_visible,
        buttons: toolbar.buttons,
      })) || [],
      fcm_topics: fcmTopics?.map(topic => ({
        topic_name: topic.topic_name,
        topic_id: topic.topic_id,
        description: topic.description,
        is_default: topic.is_default,
        is_active: topic.is_active,
      })) || [],
      styles: styles?.map(style => ({
        style_key: style.style_key,
        style_value: style.style_value,
        style_category: style.style_category,
        description: style.description,
      })) || [],
      exported_at: new Date().toISOString(),
      version: '1.0',
    };

    // 파일 다운로드를 위한 헤더 설정
    const fileName = `${app.app_id}_config_${new Date().toISOString().split('T')[0]}.json`;
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json<ApiResponse<AppExport>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 