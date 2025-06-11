export interface App {
  id: string;
  app_name: string;
  app_id: string;
  package_name: string;
  version: string;
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: string;
  app_id: string;
  menu_id: string;
  title: string;
  icon?: string;
  order_index: number;
  parent_id?: string;
  menu_type: 'item' | 'category' | 'divider';
  action_type?: 'navigate' | 'external_link' | 'api_call';
  action_value?: string;
  is_visible: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppToolbar {
  id: string;
  app_id: string;
  toolbar_id: string;
  title: string;
  position: 'top' | 'bottom';
  background_color: string;
  text_color: string;
  height: number;
  is_visible: boolean;
  buttons: ToolbarButton[];
  created_at: string;
  updated_at: string;
}

export interface ToolbarButton {
  id: string;
  title: string;
  icon?: string;
  action_type: 'navigate' | 'external_link' | 'api_call';
  action_value: string;
  order_index: number;
}

export interface AppFcmTopic {
  id: string;
  app_id: string;
  topic_name: string;
  topic_id: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppStyle {
  id: string;
  app_id: string;
  style_key: string;
  style_value: string;
  style_category: 'color' | 'typography' | 'spacing' | 'component' | 'layout';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppRequest {
  app_name: string;
  app_id: string;
  package_name: string;
  version?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 