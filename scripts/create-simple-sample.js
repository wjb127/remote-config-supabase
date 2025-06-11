require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL과 키가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimpleSampleData() {
  try {
    console.log('🚀 간단한 샘플 데이터 생성을 시작합니다...');

    // 1. 간단한 앱 생성
    const { data: app, error: appError } = await supabase
      .from('app')
      .insert({
        app_name: '테스트 앱',
        app_id: 'com.test.simple',
        package_name: 'com.test.simple',
        version: '1.0.0',
        description: '간단한 Remote Config 테스트용 앱',
        status: 'active'
      })
      .select()
      .single();

    if (appError) {
      console.error('앱 생성 중 오류:', appError);
      throw appError;
    }
    console.log('✅ 앱 생성됨:', app.app_name);

    const appId = app.id;

    // 2. 간단한 메뉴 2개만 생성
    const menuData = [
      {
        app_id: appId,
        menu_id: 'home',
        title: '홈',
        icon: 'home',
        order_index: 0,
        parent_id: null,
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/home',
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'profile',
        title: '프로필',
        icon: 'user',
        order_index: 1,
        parent_id: null,
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/profile',
        is_visible: true,
        is_enabled: true
      }
    ];

    const { data: menus, error: menuError } = await supabase
      .from('menu')
      .insert(menuData)
      .select();

    if (menuError) throw menuError;
    console.log('✅ 메뉴 생성됨:', menus.length, '개');

    // 3. 간단한 스타일 3개만 생성
    const styleData = [
      {
        app_id: appId,
        style_key: 'primary_color',
        style_value: '#007AFF',
        style_category: 'color',
        description: '메인 색상'
      },
      {
        app_id: appId,
        style_key: 'font_size',
        style_value: '16sp',
        style_category: 'typography',
        description: '기본 글자 크기'
      },
      {
        app_id: appId,
        style_key: 'button_radius',
        style_value: '8dp',
        style_category: 'component',
        description: '버튼 모서리 둥글기'
      }
    ];

    const { data: styles, error: styleError } = await supabase
      .from('app_style')
      .insert(styleData)
      .select();

    if (styleError) throw styleError;
    console.log('✅ 스타일 생성됨:', styles.length, '개');

    console.log('\n🎉 간단한 샘플 데이터 생성이 완료되었습니다!');
    console.log('📱 앱 ID:', app.app_id);
    console.log('🔗 Remote Config URL:', `http://localhost:3000/api/config/${app.app_id}`);
    console.log('\n📋 생성된 데이터:');
    console.log('   - 메뉴: 홈, 프로필');
    console.log('   - 스타일: primary_color, font_size, button_radius');

  } catch (error) {
    console.error('샘플 데이터 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
createSimpleSampleData(); 