import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, AppToolbar } from '@/types/database';

// GET /api/apps/[id]/toolbars/[toolbarId] - 특정 툴바 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; toolbarId: string }> }
) {
  const { id, toolbarId } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('app_toolbar')
      .select('*')
      .eq('app_id', id)
      .eq('id', toolbarId)
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<AppToolbar>>({
        success: false,
        error: error.message,
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: true,
      data,
    });
  } catch {
    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// PUT /api/apps/[id]/toolbars/[toolbarId] - 툴바 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; toolbarId: string }> }
) {
  const { id, toolbarId } = await params;
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('app_toolbar')
      .update(body)
      .eq('app_id', id)
      .eq('id', toolbarId)
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
      message: '툴바가 성공적으로 수정되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
    }, { status: 400 });
  }
}

// DELETE /api/apps/[id]/toolbars/[toolbarId] - 툴바 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; toolbarId: string }> }
) {
  const { id, toolbarId } = await params;
  try {
    const { error } = await supabaseAdmin
      .from('app_toolbar')
      .delete()
      .eq('app_id', id)
      .eq('id', toolbarId);

    if (error) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '툴바가 성공적으로 삭제되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 