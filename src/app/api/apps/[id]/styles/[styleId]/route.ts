import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, AppStyle } from '@/types/database';

// GET /api/apps/[id]/styles/[styleId] - 특정 스타일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; styleId: string }> }
) {
  const { id, styleId } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('app_style')
      .select('*')
      .eq('app_id', id)
      .eq('id', styleId)
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<AppStyle>>({
        success: false,
        error: error.message,
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppStyle>>({
      success: true,
      data,
    });
  } catch {
    return NextResponse.json<ApiResponse<AppStyle>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// PUT /api/apps/[id]/styles/[styleId] - 스타일 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; styleId: string }> }
) {
  const { id, styleId } = await params;
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('app_style')
      .update(body)
      .eq('app_id', id)
      .eq('id', styleId)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<AppStyle>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<AppStyle>>({
      success: true,
      data,
      message: '스타일이 성공적으로 수정되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<AppStyle>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
    }, { status: 400 });
  }
}

// DELETE /api/apps/[id]/styles/[styleId] - 스타일 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; styleId: string }> }
) {
  const { id, styleId } = await params;
  try {
    const { error } = await supabaseAdmin
      .from('app_style')
      .delete()
      .eq('app_id', id)
      .eq('id', styleId);

    if (error) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '스타일이 성공적으로 삭제되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 