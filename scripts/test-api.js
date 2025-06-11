require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_ID = 'com.example.shopping';

async function testAPI() {
  console.log('🧪 API 테스트를 시작합니다...\n');

  try {
    // 1. Remote Config API 테스트
    console.log('1️⃣ Remote Config API 테스트');
    const configUrl = `${BASE_URL}/api/config/${APP_ID}`;
    console.log(`URL: ${configUrl}`);
    
    const configResponse = await fetch(configUrl);
    const configData = await configResponse.json();
    
    if (configData.success) {
      console.log('✅ Remote Config 조회 성공');
      console.log(`   - 앱: ${configData.data.app.app_name}`);
      console.log(`   - 메뉴: ${configData.data.menus.length}개`);
      console.log(`   - 툴바: ${configData.data.toolbars.length}개`);
      console.log(`   - FCM 토픽: ${configData.data.fcm_topics.length}개`);
      console.log(`   - 스타일: ${configData.data.styles.length}개\n`);
    } else {
      console.log('❌ Remote Config 조회 실패:', configData.error);
    }

    // 2. 개별 API 테스트
    const appUuid = configData.data?.app?.id;
    if (appUuid) {
      console.log('2️⃣ 개별 API 테스트');
      
      // 메뉴 API 테스트
      const menusResponse = await fetch(`${BASE_URL}/api/apps/${appUuid}/menus`);
      const menusData = await menusResponse.json();
      console.log(`   - 메뉴 API: ${menusData.success ? '✅' : '❌'} (${menusData.data?.length || 0}개)`);
      
      // 툴바 API 테스트
      const toolbarsResponse = await fetch(`${BASE_URL}/api/apps/${appUuid}/toolbars`);
      const toolbarsData = await toolbarsResponse.json();
      console.log(`   - 툴바 API: ${toolbarsData.success ? '✅' : '❌'} (${toolbarsData.data?.length || 0}개)`);
      
      // FCM 토픽 API 테스트
      const topicsResponse = await fetch(`${BASE_URL}/api/apps/${appUuid}/fcm_topics`);
      const topicsData = await topicsResponse.json();
      console.log(`   - FCM 토픽 API: ${topicsData.success ? '✅' : '❌'} (${topicsData.data?.length || 0}개)`);
      
      // 스타일 API 테스트
      const stylesResponse = await fetch(`${BASE_URL}/api/apps/${appUuid}/styles`);
      const stylesData = await stylesResponse.json();
      console.log(`   - 스타일 API: ${stylesData.success ? '✅' : '❌'} (${stylesData.data?.length || 0}개)\n`);
    }

    // 3. 샘플 데이터 미리보기
    console.log('3️⃣ 샘플 데이터 미리보기');
    
    if (configData.success && configData.data) {
      const { app, menus, toolbars, fcm_topics: fcmTopics, styles } = configData.data;
      
      console.log('📱 앱 정보:');
      console.log(`   - 이름: ${app.app_name}`);
      console.log(`   - 패키지: ${app.package_name}`);
      console.log(`   - 버전: ${app.version}\n`);
      
      console.log('🍽️ 메뉴 구조:');
      const rootMenus = menus.filter(m => !m.parent_id && m.is_visible)
        .sort((a, b) => a.order_index - b.order_index);
      
      rootMenus.forEach(menu => {
        if (menu.menu_type === 'divider') {
          console.log('   ─────────────');
        } else {
          console.log(`   ${menu.icon || '•'} ${menu.title} (${menu.menu_type})`);
          
          // 하위 메뉴 표시
          const children = menus.filter(m => m.parent_id === menu.id && m.is_visible)
            .sort((a, b) => a.order_index - b.order_index);
          children.forEach(child => {
            console.log(`     ↳ ${child.icon || '•'} ${child.title}`);
          });
        }
      });
      
      console.log('\n🔧 툴바 정보:');
      toolbars.forEach(toolbar => {
        console.log(`   - ${toolbar.title} (${toolbar.position}, ${toolbar.buttons.length}개 버튼)`);
        toolbar.buttons.forEach(button => {
          console.log(`     • ${button.title} → ${button.action_value}`);
        });
      });
      
      console.log('\n📢 FCM 토픽:');
      fcmTopics.forEach(topic => {
        const status = topic.is_active ? (topic.is_default ? '🔔 기본' : '🔕 선택') : '❌ 비활성';
        console.log(`   ${status} ${topic.topic_name} (${topic.topic_id})`);
      });
      
      console.log('\n🎨 스타일 설정:');
      const stylesByCategory = {};
      styles.forEach(style => {
        if (!stylesByCategory[style.style_category]) {
          stylesByCategory[style.style_category] = [];
        }
        stylesByCategory[style.style_category].push(style);
      });
      
      Object.keys(stylesByCategory).forEach(category => {
        console.log(`   ${category}:`);
        stylesByCategory[category].forEach(style => {
          console.log(`     • ${style.style_key}: ${style.style_value}`);
        });
      });
    }

    console.log('\n🎉 API 테스트가 완료되었습니다!');
    console.log('\n📋 사용 방법:');
    console.log(`   1. Android 앱에서 다음 URL을 호출하세요:`);
    console.log(`      ${BASE_URL}/api/config/${APP_ID}`);
    console.log(`   2. 응답 데이터를 파싱하여 앱 UI를 동적으로 구성하세요.`);
    console.log(`   3. 자세한 구현 방법은 docs/KOTLIN_API_GUIDE.md를 참고하세요.`);

  } catch (error) {
    console.error('❌ API 테스트 중 오류 발생:', error.message);
  }
}

// 스크립트 실행
testAPI(); 