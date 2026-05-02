<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container">
      <!-- Content -->
      <div class="modal-content">
        <h3 class="modal-title">確定要刪除此對話嗎？</h3>
        <p class="modal-description">刪除後將無法恢復此對話記錄</p>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <button class="btn-confirm" @click="handleConfirm">刪除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const handleConfirm = (): void => {
  emit('confirm');
};

const handleCancel = (): void => {
  emit('cancel');
};

const handleOverlayClick = (event: Event): void => {
  if (event.target === event.currentTarget) {
    handleCancel();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0 0 0 / 20%);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-container {
  width: 90%;
  max-width: 400px;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 10%),
    0 10px 10px -5px rgb(0 0 0 / 4%);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  margin-bottom: 1.5rem;
}

.modal-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: var(--radius-sm);
}

.btn-cancel {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.btn-cancel:hover {
  background-color: var(--bg-overlay);
  transition: background-color 0.15s ease;
}

.btn-confirm {
  color: white;
  background-color: var(--error);
}

.btn-confirm:hover {
  background-color: var(--error-hover);
  transition: background-color 0.15s ease;
}
</style>
