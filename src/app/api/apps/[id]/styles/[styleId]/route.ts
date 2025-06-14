import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, AppStyle } from '@/types/database';

// GET /api/apps/[id]/styles/[styleId] - 특정 스타일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; styleId: string }> }
) {
  const { id, styleId } = await params;
  try {
    const result = await query(
      'SELECT * FROM app_style WHERE app_id = $1 AND id = $2',
      [id, styleId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<AppStyle>>({
        success: false,
        error: '스타일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppStyle>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
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
    
    const result = await query(
      `UPDATE app_style 
       SET style_key = $1, style_value = $2, style_category = $3, 
           description = $4, updated_at = NOW()
       WHERE app_id = $5 AND id = $6
       RETURNING *`,
      [
        body.style_key,
        body.style_value,
        body.style_category,
        body.description,
        id,
        styleId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<AppStyle>>({
        success: false,
        error: '스타일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppStyle>>({
      success: true,
      data: result.rows[0],
      message: '스타일이 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppStyle>>({
      success: false,
      error: '스타일 수정 중 오류가 발생했습니다.',
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
    const result = await query(
      'DELETE FROM app_style WHERE app_id = $1 AND id = $2 RETURNING *',
      [id, styleId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '스타일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '스타일이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '스타일 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 