import { NextRequest, NextResponse } from 'next/server';

const FCM_API_BASE_URL = 'https://remote-config-node-express.onrender.com/api/fcm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    const body = await request.json();
    
    // Node.js 백엔드 FCM API 호출
    const response = await fetch(`${FCM_API_BASE_URL}/broadcast/${appId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('FCM 브로드캐스트 API 호출 실패:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { 
        success: false, 
        error: '브로드캐스트 전송 중 오류가 발생했습니다.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 