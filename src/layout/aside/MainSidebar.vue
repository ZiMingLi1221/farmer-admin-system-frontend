<template>
  <SearchConversationModal v-model:open="showSearchModal" />
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

        <div class="menu-divider"></div>

        <RecentConversations />
      </div>

      <div class="menu-items-bottom" :class="{ 'items-center': sidebarStore.isCollapsed }">
        <SidebarMenu
          ref="userButtonRef"
          :item="userItem"
          :is-active="showUserMenu"
          :is-collapsed="sidebarStore.isCollapsed"
          :suppress-tooltip="showUserMenu"
          @click="openUserMenu"
        />
        <Teleport to="body">
          <UserMenu
            v-if="showUserMenu"
            :position="userMenuPosition"
            @close="showUserMenu = false"
          />
        </Teleport>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SearchConversationModal from '@/components/SearchConversationModal.vue';
import { usePermission } from '@/composables/usePermission';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { useChatStore } from '@/stores/chat';
import { useSidebarStore } from '@/stores/sidebar';
import type { MenuItem } from '@/types/sidebar';

import RecentConversations from './RecentConversations.vue';
import SidebarLogo from './SidebarLogo.vue';
import SidebarMenu from './SidebarMenu.vue';
import UserMenu from './UserMenu.vue';

const sidebarStore = useSidebarStore();
const chatStore = useChatStore();
const router = useRouter();
const route = useRoute();
const { hasRoutePermission } = usePermission();

const showUserMenu = ref(false);
const showSearchModal = ref(false);
const userButtonRef = ref<InstanceType<typeof SidebarMenu> | null>(null);
const userMenuPosition = ref({ top: 0, left: 0 });

const filteredMenuItems = computed(() => {
  return NAVIGATION_ITEMS.filter((item) => {
    if (item.id === 'new-chat' || item.id === 'search-conversation') {
      return true;
    }
    return hasRoutePermission(item.route);
  });
});

const userItem: MenuItem = {
  id: 'user-settings',
  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  label: '使用者設定',
  route: '',
};

const recalculatePosition = (): void => {
  const el = userButtonRef.value?.$el as HTMLElement | undefined;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  userMenuPosition.value = { top: rect.top, left: rect.right + 12 };
};

const openUserMenu = (): void => {
  if (showUserMenu.value) {
    showUserMenu.value = false;
    return;
  }
  const el = userButtonRef.value?.$el as HTMLElement | undefined;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  userMenuPosition.value = { top: rect.top, left: rect.right + 12 };
  showUserMenu.value = true;
};

watch(showUserMenu, (open) => {
  if (open) {
    window.addEventListener('resize', recalculatePosition);
    window.addEventListener('scroll', recalculatePosition, true);
  } else {
    window.removeEventListener('resize', recalculatePosition);
    window.removeEventListener('scroll', recalculatePosition, true);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', recalculatePosition);
  window.removeEventListener('scroll', recalculatePosition, true);
});

const handleItemClick = (item: MenuItem): void => {
  if (item.id === 'new-chat') {
    router.push('/chat');
    chatStore.setCurrentConversation(null);
    sidebarStore.setActiveModule('new-chat');
    return;
  }

  if (item.id === 'search-conversation') {
    showSearchModal.value = true;
    return;
  }

  sidebarStore.setActiveModule(item.id);
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

.menu-divider {
  height: 1px;
  margin: 0.5rem 0.75rem;
  background-color: var(--border-primary);
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
