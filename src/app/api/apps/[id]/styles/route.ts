import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, AppStyle } from '@/types/database';

// GET /api/apps/[id]/styles - 특정 앱의 스타일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await query(
      'SELECT * FROM app_style WHERE app_id = $1 ORDER BY style_category, style_key',
      [id]
    );

    return NextResponse.json<ApiResponse<AppStyle[]>>({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppStyle[]>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST /api/apps/[id]/styles - 새 스타일 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const result = await query(
      `INSERT INTO app_style (app_id, style_key, style_value, style_category, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        id,
        body.style_key,
        body.style_value,
        body.style_category,
        body.description
      ]
    );

    return NextResponse.json<ApiResponse<AppStyle>>({
      success: true,
      data: result.rows[0],
      message: '스타일이 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppStyle>>({
      success: false,
      error: '스타일 생성 중 오류가 발생했습니다.',
    }, { status: 400 });
  }
} 