import { storeToRefs } from 'pinia';

import { useSidebarStore } from '@/stores/sidebar';
import type { ModuleType } from '@/types';

export const useSidebar = () => {
  const sidebarStore = useSidebarStore();

  const { activeModule, isCollapsed, sidebarWidth } = storeToRefs(sidebarStore);

  const setActiveModule = (module: ModuleType): void => {
    sidebarStore.setActiveModule(module);
  };

  const toggleCollapsed = (): void => {
    sidebarStore.toggleCollapsed();
  };

  const setSidebarWidth = (width: number): void => {
    sidebarStore.setSidebarWidth(width);
  };

  return {
    activeModule,
    isCollapsed,
    sidebarWidth,
    setActiveModule,
    toggleCollapsed,
    setSidebarWidth,
  };
};
