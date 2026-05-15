<template>
  <div class="typing-indicator">
    <div class="typing-avatar">
      <LeafIcon class="avatar-leaf" />
    </div>
    <div class="typing-dots">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LeafIcon from '@/components/icons/LeafIcon.vue';
</script>

<style scoped>
.typing-indicator {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
  padding: 0 1rem;
  margin: 0 auto 1.75rem;
}

.typing-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-top: 0.125rem;
  color: var(--accent);
}

.avatar-leaf {
  width: 1.5rem;
  height: 1.5rem;
}

.typing-dots {
  display: flex;
  gap: 0.375rem;
  align-items: center;
  height: 1.5rem;
  padding-top: 0.625rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--text-3);
  border-radius: 9999px;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    opacity: 0.7;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-0.4rem);
  }
}

@media (width <= 768px) {
  .typing-indicator {
    padding: 0 0.75rem;
  }
}
</style>
