import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, Menu } from '@/types/database';

// GET /api/apps/[id]/menus/[menuId] - 특정 메뉴 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  const { id, menuId } = await params;
  try {
    const result = await query(
      'SELECT * FROM menu WHERE app_id = $1 AND id = $2',
      [id, menuId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<Menu>>({
        success: false,
        error: '메뉴를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<Menu>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
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
    
    const result = await query(
      `UPDATE menu 
       SET menu_id = $1, title = $2, icon = $3, order_index = $4, parent_id = $5,
           menu_type = $6, action_type = $7, action_value = $8, 
           is_visible = $9, is_enabled = $10, updated_at = NOW()
       WHERE app_id = $11 AND id = $12
       RETURNING *`,
      [
        body.menu_id,
        body.title,
        body.icon,
        body.order_index,
        body.parent_id,
        body.menu_type,
        body.action_type,
        body.action_value,
        body.is_visible,
        body.is_enabled,
        id,
        menuId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<Menu>>({
        success: false,
        error: '메뉴를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<Menu>>({
      success: true,
      data: result.rows[0],
      message: '메뉴가 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<Menu>>({
      success: false,
      error: '메뉴 수정 중 오류가 발생했습니다.',
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
    const result = await query(
      'DELETE FROM menu WHERE app_id = $1 AND id = $2 RETURNING *',
      [id, menuId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '메뉴를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '메뉴가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '메뉴 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 