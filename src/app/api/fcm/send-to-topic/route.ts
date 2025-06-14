import { NextRequest, NextResponse } from 'next/server';

const FCM_API_BASE_URL = 'https://remote-config-node-express.onrender.com/api/fcm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Node.js 백엔드 FCM API 호출
    const response = await fetch(`${FCM_API_BASE_URL}/send-to-topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('FCM API 호출 실패:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 전송 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 