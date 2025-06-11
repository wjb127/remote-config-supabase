import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateAppRequest, ApiResponse, App } from '@/types/database';

// GET /api/apps - 모든 앱 조회
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json<ApiResponse<App[]>>({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<App[]>>({
      success: true,
      data: data || [],
    });
  } catch {
    return NextResponse.json<ApiResponse<App[]>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST /api/apps - 새 앱 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateAppRequest = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('app')
      .insert([{
        app_name: body.app_name,
        app_id: body.app_id,
        package_name: body.package_name,
        version: body.version || '1.0.0',
        description: body.description,
        status: body.status || 'active',
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<App>>({
      success: true,
      data,
      message: '앱이 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<App>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
    }, { status: 400 });
  }
} 