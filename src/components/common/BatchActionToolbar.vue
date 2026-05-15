<template>
  <div class="batch-toolbar">
    <span class="batch-count">已選取 {{ count }} 項</span>
    <div class="batch-actions">
      <button class="btn-danger-outline" @click="$emit('confirm-delete')">刪除</button>
      <button class="btn-cancel" @click="$emit('cancel')">取消</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count: number;
}

defineProps<Props>();

defineEmits<{
  'confirm-delete': [];
  cancel: [];
}>();
</script>

<style scoped>
.batch-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.625rem 1rem;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}

.batch-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.batch-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.btn-danger-outline {
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--error);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--error);
  border-radius: var(--r-md);
}

.btn-danger-outline:hover {
  color: white;
  background: var(--error);
  transition: background-color 0.15s ease;
}

.btn-cancel {
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}

.btn-cancel:hover {
  color: var(--text);
  background: var(--bg);
  transition: background-color 0.15s ease;
}
</style>
