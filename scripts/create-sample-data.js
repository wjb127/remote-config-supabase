require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL과 키가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleData() {
  try {
    console.log('🚀 샘플 데이터 생성을 시작합니다...');

    // 1. 샘플 앱 생성
    console.log('앱 생성을 시도합니다...');
    const { data: app, error: appError } = await supabase
      .from('app')
      .insert({
        app_name: '쇼핑몰 앱',
        app_id: 'com.example.shopping',
        package_name: 'com.example.shopping',
        version: '1.0.0',
        description: '통합 쇼핑몰 모바일 애플리케이션',
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

    // 2. 메뉴 데이터 생성
    const menuData = [
      // 메인 메뉴들
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
        menu_id: 'categories',
        title: '카테고리',
        icon: 'grid',
        order_index: 1,
        parent_id: null,
        menu_type: 'category',
        action_type: null,
        action_value: null,
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'fashion',
        title: '패션',
        icon: 'shirt',
        order_index: 0,
        parent_id: null, // categories의 ID로 나중에 업데이트
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/category/fashion',
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'electronics',
        title: '전자제품',
        icon: 'smartphone',
        order_index: 1,
        parent_id: null, // categories의 ID로 나중에 업데이트
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/category/electronics',
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'books',
        title: '도서',
        icon: 'book',
        order_index: 2,
        parent_id: null, // categories의 ID로 나중에 업데이트
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/category/books',
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'divider1',
        title: '',
        icon: null,
        order_index: 2,
        parent_id: null,
        menu_type: 'divider',
        action_type: null,
        action_value: null,
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'cart',
        title: '장바구니',
        icon: 'shopping-cart',
        order_index: 3,
        parent_id: null,
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/cart',
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'orders',
        title: '주문내역',
        icon: 'package',
        order_index: 4,
        parent_id: null,
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/orders',
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'profile',
        title: '내 정보',
        icon: 'user',
        order_index: 5,
        parent_id: null,
        menu_type: 'item',
        action_type: 'navigate',
        action_value: '/profile',
        is_visible: true,
        is_enabled: true
      },
      {
        app_id: appId,
        menu_id: 'support',
        title: '고객지원',
        icon: 'headphones',
        order_index: 6,
        parent_id: null,
        menu_type: 'item',
        action_type: 'external_link',
        action_value: 'https://support.example.com',
        is_visible: true,
        is_enabled: true
      }
    ];

    const { data: menus, error: menuError } = await supabase
      .from('menu')
      .insert(menuData)
      .select();

    if (menuError) throw menuError;

    // 카테고리 메뉴의 ID를 찾아서 하위 메뉴들의 parent_id 업데이트
    const categoriesMenu = menus.find(m => m.menu_id === 'categories');
    if (categoriesMenu) {
      const subMenuIds = ['fashion', 'electronics', 'books'];
      await supabase
        .from('menu')
        .update({ parent_id: categoriesMenu.id })
        .in('menu_id', subMenuIds);
    }

    console.log('✅ 메뉴 생성됨:', menus.length, '개');

    // 3. 툴바 데이터 생성
    const toolbarData = {
      app_id: appId,
      toolbar_id: 'main_toolbar',
      title: '메인 툴바',
      position: 'bottom',
      background_color: '#FFFFFF',
      text_color: '#000000',
      height: 60,
      is_visible: true,
      buttons: [
        {
          id: 'btn_home',
          title: '홈',
          icon: 'home',
          action_type: 'navigate',
          action_value: '/home',
          order_index: 0
        },
        {
          id: 'btn_search',
          title: '검색',
          icon: 'search',
          action_type: 'navigate',
          action_value: '/search',
          order_index: 1
        },
        {
          id: 'btn_cart',
          title: '장바구니',
          icon: 'shopping-cart',
          action_type: 'navigate',
          action_value: '/cart',
          order_index: 2
        },
        {
          id: 'btn_profile',
          title: '내 정보',
          icon: 'user',
          action_type: 'navigate',
          action_value: '/profile',
          order_index: 3
        }
      ]
    };

    const { data: toolbar, error: toolbarError } = await supabase
      .from('app_toolbar')
      .insert(toolbarData)
      .select()
      .single();

    if (toolbarError) throw toolbarError;
    console.log('✅ 툴바 생성됨:', toolbar.title);

    // 4. FCM 토픽 데이터 생성
    const fcmTopicData = [
      {
        app_id: appId,
        topic_name: '전체 알림',
        topic_id: 'all_notifications',
        description: '모든 사용자에게 전송되는 일반 알림',
        is_default: true,
        is_active: true
      },
      {
        app_id: appId,
        topic_name: '프로모션 알림',
        topic_id: 'promotions',
        description: '할인, 이벤트 등 프로모션 관련 알림',
        is_default: false,
        is_active: true
      },
      {
        app_id: appId,
        topic_name: '주문 알림',
        topic_id: 'orders',
        description: '주문 상태 변경, 배송 정보 등 주문 관련 알림',
        is_default: false,
        is_active: true
      },
      {
        app_id: appId,
        topic_name: '신상품 알림',
        topic_id: 'new_products',
        description: '신상품 출시 알림',
        is_default: false,
        is_active: true
      }
    ];

    const { data: fcmTopics, error: fcmError } = await supabase
      .from('app_fcm_topic')
      .insert(fcmTopicData)
      .select();

    if (fcmError) throw fcmError;
    console.log('✅ FCM 토픽 생성됨:', fcmTopics.length, '개');

    // 5. 스타일 데이터 생성
    const styleData = [
      // 색상 스타일
      {
        app_id: appId,
        style_key: 'primary_color',
        style_value: '#007AFF',
        style_category: 'color',
        description: '앱의 주 색상 (파란색)'
      },
      {
        app_id: appId,
        style_key: 'secondary_color',
        style_value: '#34C759',
        style_category: 'color',
        description: '보조 색상 (녹색)'
      },
      {
        app_id: appId,
        style_key: 'accent_color',
        style_value: '#FF9500',
        style_category: 'color',
        description: '강조 색상 (오렌지)'
      },
      {
        app_id: appId,
        style_key: 'background_color',
        style_value: '#F2F2F7',
        style_category: 'color',
        description: '배경 색상 (연한 회색)'
      },
      {
        app_id: appId,
        style_key: 'text_primary',
        style_value: '#000000',
        style_category: 'color',
        description: '기본 텍스트 색상 (검정)'
      },
      {
        app_id: appId,
        style_key: 'text_secondary',
        style_value: '#6C6C70',
        style_category: 'color',
        description: '보조 텍스트 색상 (회색)'
      },
      // 타이포그래피 스타일
      {
        app_id: appId,
        style_key: 'font_family',
        style_value: 'SF Pro Display',
        style_category: 'typography',
        description: '기본 폰트 패밀리'
      },
      {
        app_id: appId,
        style_key: 'font_size_large',
        style_value: '20sp',
        style_category: 'typography',
        description: '큰 텍스트 크기'
      },
      {
        app_id: appId,
        style_key: 'font_size_medium',
        style_value: '16sp',
        style_category: 'typography',
        description: '중간 텍스트 크기'
      },
      {
        app_id: appId,
        style_key: 'font_size_small',
        style_value: '12sp',
        style_category: 'typography',
        description: '작은 텍스트 크기'
      },
      // 간격 스타일
      {
        app_id: appId,
        style_key: 'padding_large',
        style_value: '24dp',
        style_category: 'spacing',
        description: '큰 패딩'
      },
      {
        app_id: appId,
        style_key: 'padding_medium',
        style_value: '16dp',
        style_category: 'spacing',
        description: '중간 패딩'
      },
      {
        app_id: appId,
        style_key: 'padding_small',
        style_value: '8dp',
        style_category: 'spacing',
        description: '작은 패딩'
      },
      // 컴포넌트 스타일
      {
        app_id: appId,
        style_key: 'button_radius',
        style_value: '8dp',
        style_category: 'component',
        description: '버튼 모서리 둥글기'
      },
      {
        app_id: appId,
        style_key: 'card_radius',
        style_value: '12dp',
        style_category: 'component',
        description: '카드 모서리 둥글기'
      },
      {
        app_id: appId,
        style_key: 'elevation',
        style_value: '4dp',
        style_category: 'component',
        description: '기본 그림자 높이'
      }
    ];

    const { data: styles, error: styleError } = await supabase
      .from('app_style')
      .insert(styleData)
      .select();

    if (styleError) throw styleError;
    console.log('✅ 스타일 생성됨:', styles.length, '개');

    console.log('\n🎉 샘플 데이터 생성이 완료되었습니다!');
    console.log('📱 앱 ID:', appId);
    console.log('🔗 Remote Config URL:', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/config/${app.app_id}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.error('오류 세부 정보:', error.message);
    if (error.details) {
      console.error('상세 정보:', error.details);
    }
  }
}

// 스크립트 실행
createSampleData(); 