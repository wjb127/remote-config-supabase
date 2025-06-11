import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, AppFcmTopic } from '@/types/database';

// GET /api/apps/[id]/fcm_topics/[topicId] - 특정 FCM 토픽 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  const { id, topicId } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('app_fcm_topic')
      .select('*')
      .eq('app_id', id)
      .eq('id', topicId)
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<AppFcmTopic>>({
        success: false,
        error: error.message,
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: true,
      data,
    });
  } catch {
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
    
    const { data, error } = await supabaseAdmin
      .from('app_fcm_topic')
      .update(body)
      .eq('app_id', id)
      .eq('id', topicId)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<AppFcmTopic>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: true,
      data,
      message: 'FCM 토픽이 성공적으로 수정되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<AppFcmTopic>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
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
    const { error } = await supabaseAdmin
      .from('app_fcm_topic')
      .delete()
      .eq('app_id', id)
      .eq('id', topicId);

    if (error) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'FCM 토픽이 성공적으로 삭제되었습니다.',
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 