-- PostgreSQL 스키마 생성 스크립트
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. App 테이블 - 앱의 기본 정보
CREATE TABLE IF NOT EXISTS app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_name VARCHAR(100) NOT NULL,
  app_id VARCHAR(100) UNIQUE NOT NULL, -- com.example.app
  package_name VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Menu 테이블 - 앱의 메뉴 구조
CREATE TABLE IF NOT EXISTS menu (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES app(id) ON DELETE CASCADE,
  menu_id VARCHAR(50) NOT NULL, -- 메뉴 식별자
  title VARCHAR(100) NOT NULL,
  icon VARCHAR(100), -- 아이콘 이름 또는 URL
  order_index INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES menu(id) ON DELETE CASCADE,
  menu_type VARCHAR(20) DEFAULT 'item' CHECK (menu_type IN ('item', 'category', 'divider')),
  action_type VARCHAR(20) CHECK (action_type IN ('navigate', 'external_link', 'api_call')),
  action_value TEXT, -- URL, API endpoint 등
  is_visible BOOLEAN DEFAULT true,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(app_id, menu_id)
);

-- 3. App Toolbar 테이블 - 앱의 툴바 설정
CREATE TABLE IF NOT EXISTS app_toolbar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES app(id) ON DELETE CASCADE,
  toolbar_id VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  position VARCHAR(20) DEFAULT 'top' CHECK (position IN ('top', 'bottom')),
  background_color VARCHAR(20) DEFAULT '#FFFFFF',
  text_color VARCHAR(20) DEFAULT '#000000',
  height INTEGER DEFAULT 56,
  is_visible BOOLEAN DEFAULT true,
  buttons JSONB DEFAULT '[]'::jsonb, -- 툴바 버튼들의 JSON 배열
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(app_id, toolbar_id)
);

-- 4. App FCM Topic 테이블 - FCM 토픽 관리
CREATE TABLE IF NOT EXISTS app_fcm_topic (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES app(id) ON DELETE CASCADE,
  topic_name VARCHAR(100) NOT NULL,
  topic_id VARCHAR(100) NOT NULL, -- FCM 토픽 식별자
  description TEXT,
  is_default BOOLEAN DEFAULT false, -- 기본 구독 토픽 여부
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(app_id, topic_id)
);

-- 5. App Style 테이블 - 앱의 스타일 설정
CREATE TABLE IF NOT EXISTS app_style (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES app(id) ON DELETE CASCADE,
  style_key VARCHAR(100) NOT NULL, -- primary_color, secondary_color, font_family 등
  style_value TEXT NOT NULL,
  style_category VARCHAR(50) DEFAULT 'color' CHECK (style_category IN ('color', 'typography', 'spacing', 'component', 'layout')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(app_id, style_key)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_menu_app_id ON menu(app_id);
CREATE INDEX IF NOT EXISTS idx_menu_parent_id ON menu(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_order_index ON menu(order_index);
CREATE INDEX IF NOT EXISTS idx_app_toolbar_app_id ON app_toolbar(app_id);
CREATE INDEX IF NOT EXISTS idx_app_fcm_topic_app_id ON app_fcm_topic(app_id);
CREATE INDEX IF NOT EXISTS idx_app_style_app_id ON app_style(app_id);
CREATE INDEX IF NOT EXISTS idx_app_style_category ON app_style(style_category);

-- 트리거 함수 - updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS handle_app_updated_at ON app;
CREATE TRIGGER handle_app_updated_at
  BEFORE UPDATE ON app
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_menu_updated_at ON menu;
CREATE TRIGGER handle_menu_updated_at
  BEFORE UPDATE ON menu
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_app_toolbar_updated_at ON app_toolbar;
CREATE TRIGGER handle_app_toolbar_updated_at
  BEFORE UPDATE ON app_toolbar
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_app_fcm_topic_updated_at ON app_fcm_topic;
CREATE TRIGGER handle_app_fcm_topic_updated_at
  BEFORE UPDATE ON app_fcm_topic
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_app_style_updated_at ON app_style;
CREATE TRIGGER handle_app_style_updated_at
  BEFORE UPDATE ON app_style
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at(); 