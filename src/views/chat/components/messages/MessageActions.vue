<template>
  <div class="message-actions">
    <button
      v-for="action in actions"
      :key="action.key"
      type="button"
      class="action-btn"
      :class="{ 'is-pressed': action.active }"
      :aria-label="action.label"
      :data-tip="action.label"
      @click="action.onClick"
    >
      <svg
        v-if="action.key === 'copy'"
        class="action-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.COPY" />
      </svg>

      <svg
        v-else-if="action.key === 'good'"
        class="action-icon"
        :fill="action.active ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.8"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H7"
        />
      </svg>

      <svg
        v-else
        class="action-icon"
        :fill="action.active ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.8"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Zm0 0-4 8a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2l2-7a2 2 0 0 1 2-2h9"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { ICONS } from '@/constants/icons';

interface Props {
  feedback?: 'good' | 'bad';
  /** 限定只渲染「複製」（用於使用者訊息，不需點讚/踩） */
  userOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), { feedback: undefined, userOnly: false });

const emit = defineEmits<{
  copy: [];
  feedback: [kind: 'good' | 'bad'];
}>();

interface ActionItem {
  key: 'copy' | 'good' | 'bad';
  label: string;
  active: boolean;
  onClick: () => void;
}

const actions = computed<ActionItem[]>(() => {
  const base: ActionItem[] = [
    {
      key: 'copy',
      label: '複製',
      active: false,
      onClick: () => emit('copy'),
    },
  ];
  if (props.userOnly) return base;
  return [
    ...base,
    {
      key: 'good',
      label: '回答不錯',
      active: props.feedback === 'good',
      onClick: () => emit('feedback', 'good'),
    },
    {
      key: 'bad',
      label: '有待加強',
      active: props.feedback === 'bad',
      onClick: () => emit('feedback', 'bad'),
    },
  ];
});
</script>

<style scoped>
/* 訊息尾常駐操作列（不再 hover 才出現） */
.message-actions {
  display: flex;
  gap: 0.375rem;
  align-items: center;
  margin-top: 0.625rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.375rem;
  height: 2.375rem;
  color: var(--text-3);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.action-btn:hover {
  color: var(--text);
  background: var(--bg-hover);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

/* pressed/active = 填滿圖示 + 文字色（不變綠） */
.action-btn.is-pressed {
  color: var(--text);
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Tooltip 由全域 [data-tip] 接管，本元件不再自寫 ::after */
</style>
