import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, AppToolbar } from '@/types/database';

// GET /api/apps/[id]/toolbars - 특정 앱의 툴바 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await query(
      'SELECT * FROM app_toolbar WHERE app_id = $1',
      [id]
    );

    return NextResponse.json<ApiResponse<AppToolbar[]>>({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Database error:', error);
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
    
    const result = await query(
      `INSERT INTO app_toolbar (app_id, toolbar_id, title, position, background_color, 
                               text_color, height, is_visible, buttons)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        body.toolbar_id,
        body.title,
        body.position,
        body.background_color,
        body.text_color,
        body.height,
        body.is_visible,
        JSON.stringify(body.buttons || [])
      ]
    );

    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: true,
      data: result.rows[0],
      message: '툴바가 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: false,
      error: '툴바 생성 중 오류가 발생했습니다.',
    }, { status: 400 });
  }
} 