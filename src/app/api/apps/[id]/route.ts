import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, App } from '@/types/database';

// GET /api/apps/[id] - 특정 앱 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await query(
      'SELECT * FROM app WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: '앱을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<App>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<App>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// PUT /api/apps/[id] - 앱 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const result = await query(
      `UPDATE app 
       SET app_name = $1, app_id = $2, package_name = $3, 
           version = $4, description = $5, status = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        body.app_name,
        body.app_id,
        body.package_name,
        body.version,
        body.description,
        body.status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<App>>({
        success: false,
        error: '앱을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<App>>({
      success: true,
      data: result.rows[0],
      message: '앱이 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<App>>({
      success: false,
      error: '앱 수정 중 오류가 발생했습니다.',
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
    const result = await query(
      'DELETE FROM app WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '앱을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '앱이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '앱 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 