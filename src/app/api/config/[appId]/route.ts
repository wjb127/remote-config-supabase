import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types/database';

interface RemoteConfig {
  app: {
    id: string;
    app_name: string;
    app_id: string;
    package_name: string;
    version: string;
    description?: string;
    status: string;
  };
  menus: Array<{
    id: string;
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
    id: string;
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
    id: string;
    topic_name: string;
    topic_id: string;
    description?: string;
    is_default: boolean;
    is_active: boolean;
  }>;
  styles: Array<{
    id: string;
    style_key: string;
    style_value: string;
    style_category: string;
    description?: string;
  }>;
}

// GET /api/config/[appId] - 모바일 앱을 위한 전체 설정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  try {
    // 앱 정보 조회
    const { data: app, error: appError } = await supabaseAdmin
      .from('app')
      .select('*')
      .eq('app_id', appId)
      .eq('status', 'active')
      .single();

    if (appError || !app) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '앱을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 메뉴, 툴바, FCM 토픽, 스타일 정보를 병렬로 조회
    const [
      { data: menus },
      { data: toolbars },
      { data: fcmTopics },
      { data: styles }
    ] = await Promise.all([
      supabaseAdmin
        .from('menu')
        .select('*')
        .eq('app_id', app.id)
        .eq('is_visible', true)
        .order('order_index', { ascending: true }),
      supabaseAdmin
        .from('app_toolbar')
        .select('*')
        .eq('app_id', app.id)
        .eq('is_visible', true),
      supabaseAdmin
        .from('app_fcm_topic')
        .select('*')
        .eq('app_id', app.id)
        .eq('is_active', true),
      supabaseAdmin
        .from('app_style')
        .select('*')
        .eq('app_id', app.id)
    ]);

    const config: RemoteConfig = {
      app: {
        id: app.id,
        app_name: app.app_name,
        app_id: app.app_id,
        package_name: app.package_name,
        version: app.version,
        description: app.description,
        status: app.status,
      },
      menus: menus || [],
      toolbars: toolbars || [],
      fcm_topics: fcmTopics || [],
      styles: styles || [],
    };

    return NextResponse.json<ApiResponse<RemoteConfig>>({
      success: true,
      data: config,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 