<template>
  <BaseModal v-model="isOpen" :title="title" size="sm">
    <div class="modal-content">
      <p class="message-title">{{ message }}</p>
      <p v-if="detail" class="message-detail">{{ detail }}</p>
    </div>

    <template #footer>
      <button class="btn-cancel" @click="isOpen = false">取消</button>
      <button class="btn-danger" @click="handleConfirm">確認刪除</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import BaseModal from '@/components/base/BaseModal.vue';

interface Props {
  modelValue: boolean;
  title?: string;
  message: string;
  detail?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '確認刪除',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleConfirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-title {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text);
}

.message-detail {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-2);
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.btn-cancel:hover {
  color: var(--text);
  background: var(--bg-hover);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.btn-danger {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  background: var(--error);
  border: none;
  border-radius: var(--r-md);
}

.btn-danger:hover {
  background: var(--error-hover);
  transition: background-color 0.15s ease;
}
</style>
