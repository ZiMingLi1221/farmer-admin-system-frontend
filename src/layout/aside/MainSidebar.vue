<template>
  <div class="main-sidebar" :class="{ collapsed: sidebarStore.isCollapsed }">
    <div class="logo-container">
      <SidebarLogo />
    </div>

    <nav class="menu-nav">
      <div
        class="menu-items-top scrollbar-custom"
        :class="{ 'items-center': sidebarStore.isCollapsed }"
      >
        <SidebarMenu
          v-for="item in filteredMenuItems"
          :key="item.id"
          :item="item"
          :is-active="sidebarStore.activeModule === item.id"
          :is-new-chat="item.id === 'new-chat'"
          :is-collapsed="sidebarStore.isCollapsed"
          @click="handleItemClick(item)"
        />
      </div>

      <div class="menu-items-bottom" :class="{ 'items-center': sidebarStore.isCollapsed }">
        <SidebarMenu
          :item="userItem"
          :is-active="showUserMenu"
          :is-collapsed="sidebarStore.isCollapsed"
          :suppress-tooltip="showUserMenu"
          @click="showUserMenu = !showUserMenu"
        />
        <UserMenu v-if="showUserMenu" @close="showUserMenu = false" />
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { usePermission } from '@/composables/usePermission';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { useSidebarStore } from '@/stores/sidebar';
import type { MenuItem } from '@/types/sidebar';

import SidebarLogo from './SidebarLogo.vue';
import SidebarMenu from './SidebarMenu.vue';
import UserMenu from './UserMenu.vue';

const sidebarStore = useSidebarStore();
const router = useRouter();
const route = useRoute();
const { hasRoutePermission } = usePermission();

const showUserMenu = ref(false);

const filteredMenuItems = computed(() => {
  return NAVIGATION_ITEMS.filter((item) => {
    if (item.id === 'new-chat' || item.id === 'conversation') {
      return true;
    }
    return hasRoutePermission(item.route);
  });
});

const userItem: MenuItem = {
  id: 'new-chat',
  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  label: '使用者設定',
  route: '',
};

const handleItemClick = (item: MenuItem): void => {
  sidebarStore.setActiveModule(item.id);

  if (item.id === 'new-chat') {
    router.push('/chat');
    sidebarStore.setSecondaryExpanded(true);
    sidebarStore.setActiveModule('conversation');
    return;
  }

  if (item.route && route.path !== item.route) {
    router.push(item.route);
  }
};
</script>

<style scoped>
.main-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 220px;
  height: 100vh;
  padding: 1.5rem 0 0;
  overflow: hidden;
  background-color: var(--bg-secondary);

  /* width 動畫屬於 layout 位移，不會造成主題切換黑閃，可放基礎樣式 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-sidebar.collapsed {
  width: 64px;
}

.logo-container {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 3.5rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.menu-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.menu-items-top {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 0.75rem;
  overflow: hidden auto;
}

.menu-items-bottom {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  padding: 1rem 0.75rem 1.5rem;
  margin-top: auto;
  background-color: var(--bg-secondary);
}
</style>
