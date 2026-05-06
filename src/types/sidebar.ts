export type ModuleType =
  | 'new-chat'
  | 'search-conversation'
  | 'knowledge-base'
  | 'eform'
  | 'organization'
  | 'logs'
  | 'user-settings';

export interface MenuItem {
  id: ModuleType;
  icon: string;
  label: string;
  route: string;
}
