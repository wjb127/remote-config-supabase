import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, App } from '@/types/database';

// POST /api/apps/[id]/clone - 앱 복제
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { app_name, app_id, package_name } = body;

    if (!app_name || !app_id || !package_name) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: '새 앱 이름, 앱 ID, 패키지명이 필요합니다.',
      }, { status: 400 });
    }

    // 원본 앱과 모든 설정 조회
    const [
      { data: originalApp, error: appError },
      { data: menus, error: menusError },
      { data: toolbars, error: toolbarsError },
      { data: fcmTopics, error: fcmTopicsError },
      { data: styles, error: stylesError }
    ] = await Promise.all([
      supabaseAdmin.from('app').select('*').eq('id', id).single(),
      supabaseAdmin.from('menu').select('*').eq('app_id', id),
      supabaseAdmin.from('app_toolbar').select('*').eq('app_id', id),
      supabaseAdmin.from('app_fcm_topic').select('*').eq('app_id', id),
      supabaseAdmin.from('app_style').select('*').eq('app_id', id)
    ]);

    if (appError || !originalApp) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: '원본 앱을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    if (menusError || toolbarsError || fcmTopicsError || stylesError) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: '앱 설정 조회 중 오류가 발생했습니다.',
      }, { status: 500 });
    }

    // 새 앱 생성
    const { data: newApp, error: newAppError } = await supabaseAdmin
      .from('app')
      .insert([{
        app_name,
        app_id,
        package_name,
        version: originalApp.version,
        description: `${originalApp.description} (복제됨)`,
        status: 'inactive', // 새로 복제된 앱은 비활성 상태로 시작
      }])
      .select()
      .single();

    if (newAppError || !newApp) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: '새 앱 생성 중 오류가 발생했습니다.',
      }, { status: 400 });
    }

    // 메뉴 복제
    if (menus && menus.length > 0) {
      const newMenus = menus.map(menu => ({
        app_id: newApp.id,
        menu_id: menu.menu_id,
        title: menu.title,
        icon: menu.icon,
        order_index: menu.order_index,
        parent_id: menu.parent_id, // 나중에 매핑 필요
        menu_type: menu.menu_type,
        action_type: menu.action_type,
        action_value: menu.action_value,
        is_visible: menu.is_visible,
        is_enabled: menu.is_enabled,
      }));

      await supabaseAdmin.from('menu').insert(newMenus);
    }

    // 툴바 복제
    if (toolbars && toolbars.length > 0) {
      const newToolbars = toolbars.map(toolbar => ({
        app_id: newApp.id,
        toolbar_id: toolbar.toolbar_id,
        title: toolbar.title,
        position: toolbar.position,
        background_color: toolbar.background_color,
        text_color: toolbar.text_color,
        height: toolbar.height,
        is_visible: toolbar.is_visible,
        buttons: toolbar.buttons,
      }));

      await supabaseAdmin.from('app_toolbar').insert(newToolbars);
    }

    // FCM 토픽 복제
    if (fcmTopics && fcmTopics.length > 0) {
      const newFcmTopics = fcmTopics.map(topic => ({
        app_id: newApp.id,
        topic_name: topic.topic_name,
        topic_id: topic.topic_id,
        description: topic.description,
        is_default: topic.is_default,
        is_active: topic.is_active,
      }));

      await supabaseAdmin.from('app_fcm_topic').insert(newFcmTopics);
    }

    // 스타일 복제
    if (styles && styles.length > 0) {
      const newStyles = styles.map(style => ({
        app_id: newApp.id,
        style_key: style.style_key,
        style_value: style.style_value,
        style_category: style.style_category,
        description: style.description,
      }));

      await supabaseAdmin.from('app_style').insert(newStyles);
    }

    return NextResponse.json<ApiResponse<App>>({
      success: true,
      data: newApp,
      message: '앱이 성공적으로 복제되었습니다.',
    }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<App>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 