<template>
  <div class="base-input">
    <label v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input-field', { error: hasError, disabled }]"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <span v-if="hasError" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string;
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  label: '',
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
  focus: [];
}>();

const hasError = computed(() => !!props.error);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleBlur = () => {
  emit('blur');
};

const handleFocus = () => {
  emit('focus');
};
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.required-mark {
  margin-left: 0.125rem;
  color: var(--error);
}

.input-field {
  width: 100%;
  padding: 0.875rem 1.125rem;
  font-size: 0.9375rem;
  color: var(--text-primary);
  outline: none;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);

  /* transition 不能加在基礎樣式，否則主題切換會黑閃 */
  transition: none;
}

.input-field::placeholder {
  color: var(--text-tertiary);
}

.input-field:focus {
  border-color: var(--primary);
  transition: border-color 0.15s ease;
}

.input-field.error {
  border-color: var(--error);
}

.input-field.error:focus {
  border-color: var(--error);
}

.input-field.disabled {
  cursor: not-allowed;
  background: var(--bg-secondary);
  opacity: 0.5;
}

.error-message {
  margin-top: -0.25rem;
  font-size: 0.8125rem;
  color: var(--error);
}
</style>
