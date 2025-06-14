import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { ApiResponse, AppFcmTopic } from '@/types/database';

// GET /api/apps/[id]/fcm_topics/[topicId] - 특정 FCM 토픽 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  const { id, topicId } = await params;
  try {
    const result = await query(
      'SELECT * FROM app_fcm_topic WHERE app_id = $1 AND id = $2',
      [id, topicId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<AppFcmTopic>>({
        success: false,
        error: 'FCM 토픽을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// PUT /api/apps/[id]/fcm_topics/[topicId] - FCM 토픽 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  const { id, topicId } = await params;
  try {
    const body = await request.json();
    
    const result = await query(
      `UPDATE app_fcm_topic 
       SET topic_name = $1, topic_id = $2, description = $3, 
           is_default = $4, is_active = $5, updated_at = NOW()
       WHERE app_id = $6 AND id = $7
       RETURNING *`,
      [
        body.topic_name,
        body.topic_id,
        body.description,
        body.is_default,
        body.is_active,
        id,
        topicId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<AppFcmTopic>>({
        success: false,
        error: 'FCM 토픽을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: true,
      data: result.rows[0],
      message: 'FCM 토픽이 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: false,
      error: 'FCM 토픽 수정 중 오류가 발생했습니다.',
    }, { status: 400 });
  }
}

// DELETE /api/apps/[id]/fcm_topics/[topicId] - FCM 토픽 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  const { id, topicId } = await params;
  try {
    const result = await query(
      'DELETE FROM app_fcm_topic WHERE app_id = $1 AND id = $2 RETURNING *',
      [id, topicId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'FCM 토픽을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'FCM 토픽이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'FCM 토픽 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 