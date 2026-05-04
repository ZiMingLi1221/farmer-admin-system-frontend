export type ModuleType =
  | 'new-chat'
  | 'search-conversation'
  | 'knowledge-base'
  | 'eform'
  | 'organization'
  | 'logs';

export interface SidebarState {
  activeModule: ModuleType;
}

export interface MenuItem {
  id: ModuleType;
  icon: string;
  label: string;
  route: string;
}
