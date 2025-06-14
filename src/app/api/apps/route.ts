import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { CreateAppRequest, ApiResponse, App } from '@/types/database';

// GET /api/apps - 모든 앱 조회
export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM app ORDER BY created_at DESC'
    );

    return NextResponse.json<ApiResponse<App[]>>({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<App[]>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST /api/apps - 새 앱 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateAppRequest = await request.json();
    
    const result = await query(
      `INSERT INTO app (app_name, app_id, package_name, version, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        body.app_name,
        body.app_id,
        body.package_name,
        body.version || '1.0.0',
        body.description,
        body.status || 'active'
      ]
    );

    return NextResponse.json<ApiResponse<App>>({
      success: true,
      data: result.rows[0],
      message: '앱이 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<App>>({
      success: false,
      error: '앱 생성 중 오류가 발생했습니다.',
    }, { status: 400 });
  }
} 