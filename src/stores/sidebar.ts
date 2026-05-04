import { computed, defineStore } from 'pinia';
import { ref } from 'vue';

import type { ModuleType } from '@/types';

export const useSidebarStore = defineStore(
  'sidebar',
  () => {
    const activeModule = ref<ModuleType>('search-conversation');
    const isCollapsed = ref<boolean>(false);
    const sidebarWidth = ref<number>(220);

    const isChatModule = computed(
      () => activeModule.value === 'search-conversation' || activeModule.value === 'new-chat'
    );

    const setActiveModule = (module: ModuleType): void => {
      activeModule.value = module;
    };

    const toggleCollapsed = (): void => {
      isCollapsed.value = !isCollapsed.value;
    };

    const setSidebarWidth = (width: number): void => {
      sidebarWidth.value = Math.min(360, Math.max(220, width));
    };

    return {
      activeModule,
      isCollapsed,
      sidebarWidth,
      isChatModule,
      setActiveModule,
      toggleCollapsed,
      setSidebarWidth,
    };
  },
  {
    persist: true,
  }
);
