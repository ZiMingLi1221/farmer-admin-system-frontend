<template>
  <div class="pagination">
    <div class="pagination-info">顯示 {{ startIndex }}-{{ endIndex }} 筆，共 {{ total }} 筆</div>
    <div class="pagination-controls">
      <span v-if="pageSize !== undefined" class="pagination-size">
        每頁
        <select
          :value="pageSize"
          @change="$emit('page-size-change', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        筆
      </span>
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        &lt;
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="['pagination-btn', { active: page === currentPage }]"
        @click="$emit('page-change', page)"
      >
        {{ page }}
      </button>
      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
      >
        &gt;
      </button>
      <span class="pagination-jump">
        跳至
        <input
          v-model.number="jumpPageModel"
          type="number"
          min="1"
          :max="totalPages"
          @keyup.enter="handleJump"
        />
        頁
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  currentPage: number;
  totalPages: number;
  total: number;
  startIndex: number;
  endIndex: number;
  pageSize?: number;
  pageSizeOptions?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: undefined,
  pageSizeOptions: () => [10, 20, 50],
});

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
  (e: 'page-size-change', size: number): void;
}>();

const jumpPageModel = ref<number>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const handleJump = () => {
  if (jumpPageModel.value && jumpPageModel.value >= 1 && jumpPageModel.value <= props.totalPages) {
    emit('page-change', jumpPageModel.value);
    jumpPageModel.value = undefined;
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  align-items: center;
  padding: 1rem 0;
}

.pagination-info {
  font-size: 0.8125rem;
  color: var(--text-2);
}

.pagination-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-left: auto;
}

.pagination-size {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-right: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-2);
}

.pagination-size select {
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
  color: var(--text);
  cursor: pointer;
  background: var(--bg-1);
  border: 2px solid var(--border);
  border-radius: var(--r-sm);
  transition: border-color 0.15s ease;
}

.pagination-size select:hover {
  border-color: var(--border-strong);
}

.pagination-size select:focus {
  outline: none;
  border-color: var(--accent);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-2);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.pagination-btn:hover:not(:disabled) {
  color: var(--text);
  background: var(--bg-hover);
}

.pagination-btn.active {
  color: var(--text-on-accent);
  background: var(--accent);
  border-color: transparent;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.pagination-jump {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-left: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-2);
}

.pagination-jump input {
  width: 3.25rem;
  height: 2rem;
  padding: 0 0.375rem;
  font-size: 0.8125rem;
  color: var(--text);
  text-align: center;
  background: var(--bg-1);
  border: 2px solid var(--border);
  border-radius: var(--r-sm);
  transition: border-color 0.15s ease;
}

.pagination-jump input:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
