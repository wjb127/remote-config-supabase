import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, Menu } from '@/types/database';

// GET /api/apps/[id]/menus - 특정 앱의 메뉴 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('menu')
      .select('*')
      .eq('app_id', id)
      .order('order_index', { ascending: true });

    if (error) {
      return NextResponse.json<ApiResponse<Menu[]>>({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<Menu[]>>({
      success: true,
      data: data || [],
    });
  } catch {
    return NextResponse.json<ApiResponse<Menu[]>>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST /api/apps/[id]/menus - 새 메뉴 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('menu')
      .insert([{
        ...body,
        app_id: id,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<Menu>>({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<Menu>>({
      success: true,
      data,
      message: '메뉴가 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<Menu>>({
      success: false,
      error: '잘못된 요청 데이터입니다.',
    }, { status: 400 });
  }
} 