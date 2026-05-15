<template>
  <div class="input-wrapper">
    <div class="input-pill" :class="{ 'is-multiline': isMultiline }">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        rows="1"
        class="input-textarea scrollbar-custom"
        placeholder="輸入訊息..."
        :disabled="chatStore.isLoading"
        @keydown="handleKeydown"
        @input="autoResize"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
      />
      <button
        type="button"
        class="send-button"
        :class="{ active: canSend }"
        :disabled="!canSend"
        aria-label="發送訊息"
        @click="handleSend"
      >
        <svg
          v-if="!chatStore.isLoading"
          class="send-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M12 19V5" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.4"
            d="M5 12l7-7 7 7"
          />
        </svg>
        <svg v-else class="send-icon spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
          <path
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <p class="input-disclaimer">AI 可能會出錯，請小心查證</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useChatStore } from '@/stores/chat';

interface Props {
  conversationId?: string;
}

const props = defineProps<Props>();
const chatStore = useChatStore();
const router = useRouter();

const inputText = ref<string>('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isComposing = ref<boolean>(false);

const MAX_HEIGHT = 200;

const canSend = computed(() => inputText.value.trim().length > 0 && !chatStore.isLoading);
const isMultiline = computed(() => inputText.value.includes('\n') || inputText.value.length > 60);

const autoResize = (): void => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  const next = Math.min(el.scrollHeight, MAX_HEIGHT);
  el.style.height = `${next}px`;
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' && !event.shiftKey && !isComposing.value) {
    event.preventDefault();
    handleSend();
  }
};

const handleSend = async (): Promise<void> => {
  if (!canSend.value) return;
  const message = inputText.value.trim();
  inputText.value = '';
  await nextTick();
  autoResize();

  try {
    const conversationId = await chatStore.sendMessage(
      props.conversationId,
      message,
      undefined,
      true
    );
    if (!props.conversationId && conversationId) {
      router.push(`/chat/${conversationId}`);
    }
  } catch (err) {
    console.error('發送訊息失敗:', err);
  }
};

/**
 * 由父層（建議卡）填入並聚焦
 */
const setText = async (text: string): Promise<void> => {
  inputText.value = text;
  await nextTick();
  autoResize();
  textareaRef.value?.focus();
  const len = textareaRef.value?.value.length ?? 0;
  textareaRef.value?.setSelectionRange(len, len);
};

defineExpose({ setText });
</script>

<style scoped>
.input-wrapper {
  width: 100%;
  max-width: 48rem;
  padding: 0.5rem 1rem 0.75rem;
  margin: 0 auto;
  pointer-events: auto;
}

.input-pill {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 1.125rem;
  background-color: var(--bg-1);
  border: 2px solid var(--border);
  border-radius: 1.75rem;
}

.input-pill.is-multiline {
  border-radius: 1.25rem;
}

.input-pill:focus-within {
  border-color: var(--accent);
  transition: border-color 0.15s ease;
}

.input-textarea {
  flex: 1;
  min-height: 1.75rem;
  max-height: 200px;
  padding: 0.375rem 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text);
  resize: none;
  outline: none;
  background: transparent;
  border: none;
}

.input-textarea::placeholder {
  color: var(--text-3);
}

.input-textarea:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.send-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--text-3);
  cursor: not-allowed;
  background-color: var(--bg-hover);
  border: none;
  border-radius: 9999px;
}

.send-button.active {
  color: var(--text-on-accent);
  cursor: pointer;
  background-color: var(--accent);
}

.send-button.active:hover {
  background-color: var(--accent-hover);
  transition: background-color 0.15s ease;
}

.send-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.input-disclaimer {
  margin: 0.5rem 0 0;
  font-size: 0.6875rem;
  color: var(--text-3);
  text-align: center;
}

@media (width <= 768px) {
  .input-wrapper {
    padding: 0.5rem 0.75rem 0.75rem;
  }
}
</style>
