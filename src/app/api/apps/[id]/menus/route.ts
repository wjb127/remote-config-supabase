import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, Menu } from '@/types/database';

// GET /api/apps/[id]/menus - 특정 앱의 메뉴 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await query(
      'SELECT * FROM menu WHERE app_id = $1 ORDER BY order_index ASC',
      [id]
    );

    return NextResponse.json<ApiResponse<Menu[]>>({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<Menu[]>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST /api/apps/[id]/menus - 새 메뉴 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const result = await query(
      `INSERT INTO menu (app_id, menu_id, title, icon, order_index, parent_id, 
                        menu_type, action_type, action_value, is_visible, is_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        body.menu_id,
        body.title,
        body.icon,
        body.order_index,
        body.parent_id,
        body.menu_type,
        body.action_type,
        body.action_value,
        body.is_visible,
        body.is_enabled
      ]
    );

    return NextResponse.json<ApiResponse<Menu>>({
      success: true,
      data: result.rows[0],
      message: '메뉴가 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<Menu>>({
      success: false,
      error: '메뉴 생성 중 오류가 발생했습니다.',
    }, { status: 400 });
  }
} 