import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, AppToolbar } from '@/types/database';

// GET /api/apps/[id]/toolbars/[toolbarId] - 특정 툴바 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; toolbarId: string }> }
) {
  const { id, toolbarId } = await params;
  try {
    const result = await query(
      'SELECT * FROM app_toolbar WHERE app_id = $1 AND id = $2',
      [id, toolbarId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<AppToolbar>>({
        success: false,
        error: '툴바를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
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
    
    const result = await query(
      `UPDATE app_toolbar 
       SET toolbar_id = $1, title = $2, position = $3, background_color = $4,
           text_color = $5, height = $6, is_visible = $7, buttons = $8, updated_at = NOW()
       WHERE app_id = $9 AND id = $10
       RETURNING *`,
      [
        body.toolbar_id,
        body.title,
        body.position,
        body.background_color,
        body.text_color,
        body.height,
        body.is_visible,
        JSON.stringify(body.buttons || []),
        id,
        toolbarId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<AppToolbar>>({
        success: false,
        error: '툴바를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: true,
      data: result.rows[0],
      message: '툴바가 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppToolbar>>({
      success: false,
      error: '툴바 수정 중 오류가 발생했습니다.',
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
    const result = await query(
      'DELETE FROM app_toolbar WHERE app_id = $1 AND id = $2 RETURNING *',
      [id, toolbarId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '툴바를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '툴바가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '툴바 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 