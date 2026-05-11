<template>
  <!-- Mobile backdrop：點擊關閉整個選單 -->
  <div v-if="isMobile" class="mobile-backdrop" @click="emit('close')"></div>

  <div
    ref="menuRef"
    class="user-menu-popover"
    :class="{ 'is-mobile': isMobile }"
    :style="popoverStyle"
  >
    <!-- 主面板 -->
    <div v-show="!isMobile || currentPanel === 'main'" class="panel main-panel">
      <div v-if="userInfo" class="user-info-section">
        <div class="user-avatar-large">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.USER" />
          </svg>
        </div>
        <div class="user-details">
          <div class="user-id">{{ userInfo.name }}</div>
          <div class="user-meta">
            <span class="role-tag">{{ ROLE_LABELS[userInfo.role] }}</span>
            <span class="dept-text">{{ userInfo.department }}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="actions-section">
        <div
          class="action-item-wrapper"
          @mouseenter="handleSubmenuEnter"
          @mouseleave="handleSubmenuLeave"
        >
          <button class="action-item" @click="handleAppearanceClick">
            <svg
              aria-hidden="true"
              class="action-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="ICONS.SUN"
              />
            </svg>
            <span>外觀</span>
            <svg
              aria-hidden="true"
              class="submenu-arrow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="ICONS.CHEVRON_RIGHT"
              />
            </svg>
          </button>

          <!-- 桌面 hover 子選單 -->
          <div
            v-show="!isMobile && showAppearanceSubmenu"
            class="appearance-submenu"
            @mouseenter="handleSubmenuEnter"
            @mouseleave="handleSubmenuLeave"
          >
            <button
              v-for="option in themeOptions"
              :key="option.value"
              class="submenu-item"
              :class="{ active: theme === option.value }"
              @click="handleThemeSelect(option.value)"
            >
              <svg
                aria-hidden="true"
                class="submenu-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="ICONS[option.icon]"
                />
              </svg>
              <span>{{ option.label }}</span>
              <svg
                v-if="theme === option.value"
                aria-hidden="true"
                class="check-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="ICONS.CHECK"
                />
              </svg>
            </button>
          </div>
        </div>

        <button class="action-item" @click="handleChangePassword">
          <svg
            aria-hidden="true"
            class="action-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.EDIT" />
          </svg>
          <span>變更密碼</span>
        </button>
      </div>

      <div class="divider"></div>

      <div class="actions-section">
        <button class="action-item logout" @click="handleLogout">
          <svg
            aria-hidden="true"
            class="action-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="ICONS.LOGOUT"
            />
          </svg>
          <span>退出登錄</span>
        </button>
      </div>
    </div>

    <!-- 外觀子面板（mobile） -->
    <div
      v-show="isMobile && currentPanel === 'appearance'"
      class="actions-section appearance-panel"
    >
      <button
        v-for="option in themeOptions"
        :key="option.value"
        class="submenu-item"
        :class="{ active: theme === option.value }"
        @click="handleThemeSelect(option.value)"
      >
        <svg
          aria-hidden="true"
          class="submenu-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="ICONS[option.icon]"
          />
        </svg>
        <span>{{ option.label }}</span>
        <svg
          v-if="theme === option.value"
          aria-hidden="true"
          class="check-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.CHECK" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useTheme } from '@/composables/useTheme';
import { ICONS } from '@/constants/icons';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import type { ThemeMode } from '@/types/theme';
import { ROLE_LABELS } from '@/types/user';

interface Props {
  position: { bottom: number; left: number };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const { theme, setTheme } = useTheme();
const authStore = useAuthStore();
const userStore = useUserStore();
const menuRef = ref<HTMLDivElement | null>(null);
const showAppearanceSubmenu = ref(false);
const currentPanel = ref<'main' | 'appearance'>('main');
const isMobile = ref(false);
let mql: MediaQueryList | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const updateIsMobile = (e: MediaQueryListEvent | MediaQueryList): void => {
  isMobile.value = e.matches;
};

const popoverStyle = computed(() => {
  if (isMobile.value) return undefined;
  return { bottom: props.position.bottom + 'px', left: props.position.left + 'px' };
});

const handleSubmenuEnter = (): void => {
  if (isMobile.value) return;
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  showAppearanceSubmenu.value = true;
};

const handleSubmenuLeave = (): void => {
  if (isMobile.value) return;
  closeTimer = setTimeout(() => {
    showAppearanceSubmenu.value = false;
  }, 150);
};

const handleAppearanceClick = (event: MouseEvent): void => {
  if (isMobile.value) {
    event.stopPropagation();
    currentPanel.value = 'appearance';
  }
};

const userInfo = computed(() => userStore.user);

const themeOptions = [
  { value: 'light' as const, label: '淺色', icon: 'SUN' as const },
  { value: 'dark' as const, label: '深色', icon: 'MOON' as const },
  { value: 'system' as const, label: '跟隨系統', icon: 'COMPUTER' as const },
];

const handleThemeSelect = (value: ThemeMode): void => {
  setTheme(value);
};

const handleLogout = (): void => {
  authStore.logout();
  userStore.clearUser();
  emit('close');
  router.push('/login');
};

const handleChangePassword = (): void => {
  emit('close');
  router.push('/change-password');
};

const handleClickOutside = (event: MouseEvent): void => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close');
  }
};

onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)');
  isMobile.value = mql.matches;
  mql.addEventListener('change', updateIsMobile);
  setTimeout(() => {
    window.addEventListener('click', handleClickOutside);
  }, 0);
});

onUnmounted(() => {
  mql?.removeEventListener('change', updateIsMobile);
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-menu-popover {
  position: fixed;
  z-index: 1000;
  width: 16rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow:
    0 10px 25px -5px rgb(0 0 0 / 15%),
    0 8px 10px -6px rgb(0 0 0 / 10%);
  animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* mobile bottom sheet */
.user-menu-popover.is-mobile {
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  border-bottom: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  animation: sheetSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgb(0 0 0 / 50%);
  animation: fadeIn 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sheetSlideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 子面板標頭 */
.panel-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.back-btn:hover {
  background: var(--bg-tertiary);
}

.back-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 使用者資訊 */
.user-info-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
}

.user-avatar-large {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  color: var(--text-on-primary);
  background: linear-gradient(135deg, var(--primary), var(--info-blue));
  border-radius: 50%;
}

.user-avatar-large svg {
  width: 1.5rem;
  height: 1.5rem;
}

.user-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.user-id {
  font-family: 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.user-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.role-tag {
  padding: 0.125rem 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary);
  background: var(--primary-light);
  border-radius: var(--radius-sm);
}

.dept-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* 區隔線 */
.divider {
  height: 1px;
  background-color: var(--border-primary);
}

/* 功能操作 */
.actions-section {
  padding: 0.5rem;
}

.action-item-wrapper {
  position: relative;
}

.action-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.action-item:hover {
  background: var(--bg-tertiary);
  transition: background-color 0.15s ease;
}

.action-item.logout {
  color: var(--error);
}

.action-item.logout:hover {
  background: color-mix(in srgb, var(--error) 10%, transparent);
}

.action-icon {
  flex-shrink: 0;
  width: 1.1rem;
  height: 1.1rem;
}

.submenu-arrow {
  width: 1rem;
  height: 1rem;
  margin-left: auto;
  color: var(--text-tertiary);
}

/* 外觀子選單（桌面 hover popout） */
.appearance-submenu {
  position: absolute;
  top: 0;
  left: calc(100% + 0.25rem);
  z-index: 101;
  width: 10rem;
  padding: 0.375rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow:
    0 10px 25px -5px rgb(0 0 0 / 15%),
    0 8px 10px -6px rgb(0 0 0 / 10%);
}

/* 橋接 parent 與 submenu 之間的 4px 間隙，防止 mouseleave 提早觸發 */
.appearance-submenu::before {
  position: absolute;
  top: 0;
  left: -0.25rem;
  width: 0.25rem;
  height: 100%;
  content: '';
}

.submenu-item {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-primary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.submenu-item:hover {
  background: var(--bg-tertiary);
  transition: background-color 0.15s ease;
}

.submenu-item.active {
  font-weight: 500;
  color: var(--primary);
}

.submenu-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.check-icon {
  flex-shrink: 0;
  width: 0.875rem;
  height: 0.875rem;
  margin-left: auto;
  color: var(--primary);
}
</style>
