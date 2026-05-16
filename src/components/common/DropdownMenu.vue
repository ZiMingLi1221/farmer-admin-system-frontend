<template>
  <Teleport to="body">
    <div v-if="open" class="dropdown-menu" :style="menuStyle" @click.stop>
      <button
        v-for="item in items"
        :key="item.key"
        class="dropdown-menu-item"
        :class="{ danger: item.danger, disabled: item.disabled }"
        :disabled="item.disabled"
        @click="handleSelect(item.key)"
      >
        <svg
          v-if="item.icon"
          class="dropdown-menu-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
        </svg>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';

export interface DropdownMenuItem {
  key: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
}

interface Props {
  items: DropdownMenuItem[];
  open: boolean;
  anchor: HTMLElement | null;
  align?: 'left' | 'right';
}

const props = withDefaults(defineProps<Props>(), {
  align: 'right',
});

const emit = defineEmits<{
  (e: 'select', key: string): void;
  (e: 'close'): void;
}>();

const menuStyle = computed(() => {
  if (!props.anchor) return {};
  const rect = props.anchor.getBoundingClientRect();
  const top = `${rect.bottom + 4}px`;
  if (props.align === 'left') {
    return { top, left: `${rect.left}px` };
  }
  return { top, right: `${window.innerWidth - rect.right}px` };
});

const handleSelect = (key: string): void => {
  emit('select', key);
  emit('close');
};

const handleOutsideClick = (): void => {
  if (props.open) emit('close');
};

const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape' && props.open) emit('close');
};

onMounted(() => {
  window.addEventListener('click', handleOutsideClick);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick);
  window.removeEventListener('keydown', handleKeyDown);
});

// 每次 open → true 時重新計算位置（anchor 的 getBoundingClientRect 在 computed 中是 reactive 的，
// 但 anchor 本身如果是同一 ref 物件則不會觸發，menuStyle 會在 open toggle 時因 open 本身重算）
watch(
  () => props.open,
  () => {
    // computed menuStyle 本身已是 reactive，此 watch 僅作為說明；
    // 如 anchor 位置在 open 後才移動，可在此強制更新，目前場景不需要。
  }
);
</script>

<style scoped>
.dropdown-menu {
  position: fixed;
  z-index: 9999;
  min-width: 8rem;
  padding: 0.375rem;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow:
    0 4px 12px rgb(0 0 0 / 15%),
    0 2px 4px rgb(0 0 0 / 10%);
}

.dropdown-menu-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.dropdown-menu-item:hover:not([disabled]) {
  background: var(--bg-hover);
  transition: background-color 0.15s ease;
}

.dropdown-menu-item.danger {
  color: var(--error);
}

.dropdown-menu-item.danger:hover {
  background: color-mix(in srgb, var(--error) 10%, transparent);
  transition: background-color 0.15s ease;
}

.dropdown-menu-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dropdown-menu-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}
</style>
