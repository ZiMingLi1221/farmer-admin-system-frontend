<template>
  <BaseModal
    v-model="isOpen"
    :title="isEdit ? '編輯業務別' : '新增業務別'"
    size="md"
    :confirm-disabled="!isFormValid"
    @confirm="handleSubmit"
    @close="handleClose"
  >
    <form class="form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label required">業務別名稱</label>
        <input
          v-model="formData.name"
          type="text"
          class="form-input"
          placeholder="例如：放款業務"
          required
        />
        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">說明（選填）</label>
        <input
          v-model="formData.description"
          type="text"
          class="form-input"
          placeholder="業務別用途說明"
        />
      </div>

      <div class="form-group">
        <label class="form-checkbox">
          <input v-model="formData.active" type="checkbox" />
          <span>啟用</span>
        </label>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import BaseModal from '@/components/base/BaseModal.vue';
import type {
  BusinessType,
  CreateBusinessTypePayload,
  UpdateBusinessTypePayload,
} from '@/types/department';

interface Props {
  modelValue: boolean;
  businessType?: BusinessType | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [data: CreateBusinessTypePayload | UpdateBusinessTypePayload];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isEdit = computed(() => !!props.businessType);
const errorMessage = ref('');

const defaultFormData = { name: '', description: '', active: true };
const formData = ref({ ...defaultFormData });

const isFormValid = computed(() => formData.value.name.trim() !== '');

watch(
  () => props.businessType,
  (bt) => {
    if (bt) {
      formData.value = { name: bt.name, description: bt.description ?? '', active: bt.active };
    } else {
      formData.value = { ...defaultFormData };
    }
    errorMessage.value = '';
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (!isFormValid.value) return;
  errorMessage.value = '';
  const payload = {
    name: formData.value.name.trim(),
    description: formData.value.description.trim() || undefined,
    active: formData.value.active,
  };
  emit('submit', payload);
};

const handleClose = () => {
  formData.value = { ...defaultFormData };
  errorMessage.value = '';
};

function setError(msg: string) {
  errorMessage.value = msg;
}

defineExpose({ setError });
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.form-label.required::after {
  color: var(--error);
  content: ' *';
}

.form-input {
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--text);
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-checkbox {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text);
  cursor: pointer;
}

.form-checkbox input[type='checkbox'] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.form-error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--error);
}
</style>
