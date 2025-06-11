import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, AppToolbar } from '@/types/database';

// GET /api/apps/[id]/toolbars - 특정 앱의 툴바 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('app_toolbar')
      .select('*')
      .eq('app_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json<ApiResponse<AppToolbar[]>>({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<AppToolbar[]>>({
      success: true,
      data: data || [],
    });
  } catch {
    return NextResponse.json<ApiResponse<AppToolbar[]>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST /api/apps/[id]/toolbars - 새 툴바 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('app_toolbar')
      .insert([{
        ...body,
        app_id: id,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<AppToolbar>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: true,
      data,
      message: '툴바가 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
    }, { status: 400 });
  }
} 