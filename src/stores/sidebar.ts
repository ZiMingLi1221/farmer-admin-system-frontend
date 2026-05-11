import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSidebarStore = defineStore(
  'sidebar',
  () => {
    const isCollapsed = ref<boolean>(false);
    const sidebarWidth = ref<number>(220);
    // 拖拽期間的即時寬度（不寫入 localStorage），mouseup 後才同步到 sidebarWidth
    const liveSidebarWidth = ref<number | null>(null);

    const displayWidth = computed(() => liveSidebarWidth.value ?? sidebarWidth.value);

    const toggleCollapsed = (): void => {
      isCollapsed.value = !isCollapsed.value;
    };

    const setSidebarWidth = (width: number): void => {
      sidebarWidth.value = Math.min(360, Math.max(220, width));
    };

    const isMobileDrawerOpen = ref<boolean>(false);

    const openMobileDrawer = (): void => {
      isMobileDrawerOpen.value = true;
    };
    const closeMobileDrawer = (): void => {
      isMobileDrawerOpen.value = false;
    };
    const toggleMobileDrawer = (): void => {
      isMobileDrawerOpen.value = !isMobileDrawerOpen.value;
    };

    return {
      isCollapsed,
      sidebarWidth,
      liveSidebarWidth,
      displayWidth,
      isMobileDrawerOpen,
      toggleCollapsed,
      setSidebarWidth,
      openMobileDrawer,
      closeMobileDrawer,
      toggleMobileDrawer,
    };
  },
  {
    persist: {
      pick: ['isCollapsed', 'sidebarWidth'],
    },
  }
);
