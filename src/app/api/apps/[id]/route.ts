import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, App } from '@/types/database';

// GET /api/apps/[id] - 특정 앱 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('app')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: error.message,
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<App>>({
      success: true,
      data,
    });
  } catch {
    return NextResponse.json<ApiResponse<App>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// PUT /api/apps/[id] - 앱 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('app')
      .update(body)
      .eq('id', id)
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
      message: '앱이 성공적으로 수정되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<App>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
    }, { status: 400 });
  }
}

// DELETE /api/apps/[id] - 앱 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { error } = await supabaseAdmin
      .from('app')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '앱이 성공적으로 삭제되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 