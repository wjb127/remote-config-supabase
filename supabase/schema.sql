-- Enable Row Level Security
alter table if exists public.app enable row level security;
alter table if exists public.menu enable row level security;
alter table if exists public.app_toolbar enable row level security;
alter table if exists public.app_fcm_topic enable row level security;
alter table if exists public.app_style enable row level security;

-- 1. App 테이블 - 앱의 기본 정보
create table public.app (
  id uuid default gen_random_uuid() primary key,
  app_name varchar(100) not null,
  app_id varchar(100) unique not null, -- com.example.app
  package_name varchar(100) not null,
  version varchar(20) not null default '1.0.0',
  description text,
  status varchar(20) default 'active' check (status in ('active', 'inactive', 'maintenance')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Menu 테이블 - 앱의 메뉴 구조
create table public.menu (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references public.app(id) on delete cascade,
  menu_id varchar(50) not null, -- 메뉴 식별자
  title varchar(100) not null,
  icon varchar(100), -- 아이콘 이름 또는 URL
  order_index integer not null default 0,
  parent_id uuid references public.menu(id) on delete cascade,
  menu_type varchar(20) default 'item' check (menu_type in ('item', 'category', 'divider')),
  action_type varchar(20) check (action_type in ('navigate', 'external_link', 'api_call')),
  action_value text, -- URL, API endpoint 등
  is_visible boolean default true,
  is_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(app_id, menu_id)
);

-- 3. App Toolbar 테이블 - 앱의 툴바 설정
create table public.app_toolbar (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references public.app(id) on delete cascade,
  toolbar_id varchar(50) not null,
  title varchar(100) not null,
  position varchar(20) default 'top' check (position in ('top', 'bottom')),
  background_color varchar(20) default '#FFFFFF',
  text_color varchar(20) default '#000000',
  height integer default 56,
  is_visible boolean default true,
  buttons jsonb default '[]'::jsonb, -- 툴바 버튼들의 JSON 배열
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(app_id, toolbar_id)
);

-- 4. App FCM Topic 테이블 - FCM 토픽 관리
create table public.app_fcm_topic (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references public.app(id) on delete cascade,
  topic_name varchar(100) not null,
  topic_id varchar(100) not null, -- FCM 토픽 식별자
  description text,
  is_default boolean default false, -- 기본 구독 토픽 여부
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(app_id, topic_id)
);

-- 5. App Style 테이블 - 앱의 스타일 설정
create table public.app_style (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references public.app(id) on delete cascade,
  style_key varchar(100) not null, -- primary_color, secondary_color, font_family 등
  style_value text not null,
  style_category varchar(50) default 'color' check (style_category in ('color', 'typography', 'spacing', 'component', 'layout')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(app_id, style_key)
);

-- 인덱스 생성
create index idx_menu_app_id on public.menu(app_id);
create index idx_menu_parent_id on public.menu(parent_id);
create index idx_menu_order_index on public.menu(order_index);
create index idx_app_toolbar_app_id on public.app_toolbar(app_id);
create index idx_app_fcm_topic_app_id on public.app_fcm_topic(app_id);
create index idx_app_style_app_id on public.app_style(app_id);
create index idx_app_style_category on public.app_style(style_category);

-- RLS 정책 (개발 단계에서는 모든 접근 허용)
create policy "Enable all access for authenticated users" on public.app
  for all using (true);

create policy "Enable all access for authenticated users" on public.menu
  for all using (true);

create policy "Enable all access for authenticated users" on public.app_toolbar
  for all using (true);

create policy "Enable all access for authenticated users" on public.app_fcm_topic
  for all using (true);

create policy "Enable all access for authenticated users" on public.app_style
  for all using (true);

-- 트리거 함수 - updated_at 자동 업데이트
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 트리거 생성
create trigger handle_app_updated_at
  before update on public.app
  for each row execute function public.handle_updated_at();

create trigger handle_menu_updated_at
  before update on public.menu
  for each row execute function public.handle_updated_at();

create trigger handle_app_toolbar_updated_at
  before update on public.app_toolbar
  for each row execute function public.handle_updated_at();

create trigger handle_app_fcm_topic_updated_at
  before update on public.app_fcm_topic
  for each row execute function public.handle_updated_at();

create trigger handle_app_style_updated_at
  before update on public.app_style
  for each row execute function public.handle_updated_at(); 