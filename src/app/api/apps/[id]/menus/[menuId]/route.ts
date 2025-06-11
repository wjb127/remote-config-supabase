import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, Menu } from '@/types/database';

// GET /api/apps/[id]/menus/[menuId] - 특정 메뉴 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  const { id, menuId } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('menu')
      .select('*')
      .eq('app_id', id)
      .eq('id', menuId)
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<Menu>>({
        success: false,
        error: error.message,
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<Menu>>({
      success: true,
      data,
    });
  } catch {
    return NextResponse.json<ApiResponse<Menu>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// PUT /api/apps/[id]/menus/[menuId] - 메뉴 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  const { id, menuId } = await params;
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('menu')
      .update(body)
      .eq('app_id', id)
      .eq('id', menuId)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<Menu>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<Menu>>({
      success: true,
      data,
      message: '메뉴가 성공적으로 수정되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<Menu>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
    }, { status: 400 });
  }
}

// DELETE /api/apps/[id]/menus/[menuId] - 메뉴 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  const { id, menuId } = await params;
  try {
    const { error } = await supabaseAdmin
      .from('menu')
      .delete()
      .eq('app_id', id)
      .eq('id', menuId);

    if (error) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '메뉴가 성공적으로 삭제되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 