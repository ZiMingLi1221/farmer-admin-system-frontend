<template>
  <div
    ref="sidebarRef"
    class="main-sidebar"
    :class="{ collapsed: sidebarStore.isCollapsed }"
    :style="!sidebarStore.isCollapsed ? { width: sidebarStore.displayWidth + 'px' } : {}"
  >
    <div class="logo-container">
      <SidebarLogo />
    </div>

    <nav class="menu-nav">
      <div class="menu-items-top scrollbar-custom">
        <SidebarMenu
          v-for="item in filteredMenuItems"
          :key="item.id"
          :item="item"
          :is-active="activeModule === item.id"
          :is-new-chat="item.id === 'new-chat'"
          :is-collapsed="sidebarStore.isCollapsed"
          @click="handleItemClick(item)"
        />

        <div class="menu-divider"></div>

        <RecentConversations />
      </div>

      <div class="menu-items-bottom">
        <button
          ref="userButtonRef"
          class="user-button"
          :class="{ active: showUserMenu, collapsed: sidebarStore.isCollapsed }"
          @click="openUserMenu"
        >
          <span class="user-avatar">{{ userInitial }}</span>
          <span v-if="!sidebarStore.isCollapsed" class="user-label">使用者設定</span>
        </button>
        <Teleport to="body">
          <UserMenu
            v-if="showUserMenu"
            :position="userMenuPosition"
            @close="showUserMenu = false"
          />
        </Teleport>
      </div>
    </nav>
    <div v-if="!sidebarStore.isCollapsed" class="resize-handle" @mousedown="startResize" />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { usePermission } from '@/composables/usePermission';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { useChatStore } from '@/stores/chat';
import { useSidebarStore } from '@/stores/sidebar';
import { useUserStore } from '@/stores/user';
import type { MenuItem } from '@/types/sidebar';

import RecentConversations from './RecentConversations.vue';
import SidebarLogo from './SidebarLogo.vue';
import SidebarMenu from './SidebarMenu.vue';
import UserMenu from './UserMenu.vue';

const sidebarStore = useSidebarStore();
const chatStore = useChatStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const { hasRoutePermission } = usePermission();

const showUserMenu = ref(false);
const sidebarRef = ref<HTMLElement | null>(null);

const activeModule = computed(() => route.meta?.activeModule ?? null);
const userButtonRef = ref<HTMLButtonElement | null>(null);
const userMenuPosition = ref({ bottom: 0, left: 0 });

const filteredMenuItems = computed(() => {
  return NAVIGATION_ITEMS.filter((item) => {
    if (item.id === 'new-chat' || item.id === 'search-conversation') {
      return true;
    }
    return hasRoutePermission(item.route);
  });
});

const userInitial = computed(() => {
  const name = userStore.user?.name ?? '';
  return name.charAt(0).toUpperCase() || '?';
});

const recalculatePosition = (): void => {
  const el = userButtonRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  userMenuPosition.value = {
    bottom: window.innerHeight - rect.top + 8,
    left: rect.left,
  };
};

const openUserMenu = (): void => {
  if (showUserMenu.value) {
    showUserMenu.value = false;
    return;
  }
  const el = userButtonRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  userMenuPosition.value = {
    bottom: window.innerHeight - rect.top + 8,
    left: rect.left,
  };
  showUserMenu.value = true;
};

watch(
  () => [route.name, route.params.id] as const,
  () => {
    if (route.name !== 'chat' || !route.params.id) {
      chatStore.setCurrentConversation(null);
    }
  },
  { immediate: true }
);

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
    chatStore.setCurrentConversation(null);
    router.push('/chat');
    sidebarStore.closeMobileDrawer();
    return;
  }

  if (item.id === 'search-conversation') {
    router.push('/chat/search');
    sidebarStore.closeMobileDrawer();
    return;
  }

  if (item.route && route.path !== item.route) {
    router.push(item.route);
  }
  sidebarStore.closeMobileDrawer();
};

const startResize = (e: MouseEvent): void => {
  e.preventDefault();
  const startX = e.clientX;
  const startWidth = sidebarStore.sidebarWidth;
  let rafId = 0;
  let pendingWidth = startWidth;

  sidebarStore.liveSidebarWidth = startWidth;
  sidebarRef.value?.classList.add('is-resizing');

  const flush = (): void => {
    rafId = 0;
    sidebarStore.liveSidebarWidth = Math.min(360, Math.max(220, pendingWidth));
  };

  const onMouseMove = (moveEvent: MouseEvent): void => {
    pendingWidth = startWidth + (moveEvent.clientX - startX);
    if (rafId === 0) rafId = requestAnimationFrame(flush);
  };

  const onMouseUp = (): void => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    sidebarRef.value?.classList.remove('is-resizing');
    if (rafId !== 0) cancelAnimationFrame(rafId);
    const finalWidth = sidebarStore.liveSidebarWidth;
    if (finalWidth !== null) {
      sidebarStore.setSidebarWidth(finalWidth);
      sidebarStore.liveSidebarWidth = null;
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
};
</script>

<style scoped>
.main-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  overflow: hidden;
  background-color: var(--bg-sidebar);

  /* width 動畫屬於 layout 位移，不會造成主題切換黑閃，可放基礎樣式 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-sidebar.collapsed {
  width: 64px;
}

.main-sidebar.is-resizing {
  transition: none;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
}

.resize-handle:hover {
  background-color: var(--accent);
  opacity: 0.4;
  transition:
    background-color 0.15s ease,
    opacity 0.15s ease;
}

.logo-container {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 4rem;
  margin-bottom: 0;
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
  min-height: 0;
  padding: 0.5rem 0.75rem 0;
}

.menu-divider {
  height: 1px;
  margin: 0.5rem 0.75rem;
  background-color: var(--border);
}

.menu-items-bottom {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  padding: 1rem 0.75rem 1.5rem;
  margin-top: auto;
  background-color: var(--bg-sidebar);
}

.user-button {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  height: 2.75rem;
  padding: 0 0.375rem;
  color: var(--text-2);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.user-button:hover {
  color: var(--text);
  background-color: var(--bg-sidebar-hover);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.user-button.active {
  color: var(--text);
  background-color: var(--bg-sidebar-active);
}

.user-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-on-accent);
  background-color: var(--accent);
  border-radius: 50%;
}

.user-label {
  font-size: 0.9375rem;
  font-weight: 500;
  white-space: nowrap;
}

@media (width <= 767px) {
  .main-sidebar {
    width: 280px !important;
    padding-top: 0;
  }

  .main-sidebar.collapsed {
    width: 280px !important;
  }

  .resize-handle {
    display: none;
  }
}
</style>
