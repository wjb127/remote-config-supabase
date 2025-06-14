import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, AppFcmTopic } from '@/types/database';

// GET /api/apps/[id]/fcm_topics - 특정 앱의 FCM 토픽 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await query(
      'SELECT * FROM app_fcm_topic WHERE app_id = $1 ORDER BY created_at DESC',
      [id]
    );

    return NextResponse.json<ApiResponse<AppFcmTopic[]>>({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppFcmTopic[]>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST /api/apps/[id]/fcm_topics - 새 FCM 토픽 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const result = await query(
      `INSERT INTO app_fcm_topic (app_id, topic_name, topic_id, description, is_default, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        body.topic_name,
        body.topic_id,
        body.description,
        body.is_default,
        body.is_active
      ]
    );

    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: true,
      data: result.rows[0],
      message: 'FCM 토픽이 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: false,
      error: 'FCM 토픽 생성 중 오류가 발생했습니다.',
    }, { status: 400 });
  }
} 