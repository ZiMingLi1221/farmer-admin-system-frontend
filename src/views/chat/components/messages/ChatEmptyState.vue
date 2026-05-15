<template>
  <div class="empty-state">
    <div class="hero">
      <img :src="logoUrl" alt="汐止農會 LOGO" class="hero-logo" />
      <h2 class="hero-title">您好，今天有什麼可以協助？</h2>
    </div>

    <div class="suggestion-grid">
      <button
        v-for="item in suggestions"
        :key="item.title"
        type="button"
        class="suggestion-card"
        @click="emit('select', item.title)"
      >
        <span class="suggestion-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="item.iconPath"
            />
          </svg>
        </span>
        <span class="suggestion-title">{{ item.title }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoUrl from '@/assets/images/national_farmers_logo.png';
import { ICONS } from '@/constants/icons';

const emit = defineEmits<{
  select: [text: string];
}>();

interface Suggestion {
  title: string;
  iconPath: string;
}

const suggestions: Suggestion[] = [
  { title: '幫我查找內部業務、法規知識', iconPath: ICONS.SEARCH },
  { title: '辦理業務手續', iconPath: ICONS.CLIPBOARD_LIST },
];
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 3rem 1rem 2rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
  text-align: center;
}

.hero-logo {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  object-fit: contain;
}

.hero-title {
  margin: 0;
  font-size: 1.625rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

.suggestion-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  width: 100%;
  max-width: 36rem;
}

.suggestion-card {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 14px 22px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  background-color: transparent;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
}

.suggestion-card:hover {
  background-color: var(--bg-hover);
  transition: background-color 0.15s ease;
}

.suggestion-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--text-2);
}

.suggestion-icon svg {
  width: 18px;
  height: 18px;
}

.suggestion-title {
  line-height: 1.4;
}

@media (width <= 640px) {
  .suggestion-grid {
    flex-direction: column;
    align-items: center;
  }

  .hero-title {
    font-size: 1.375rem;
  }

  .hero-logo {
    width: 3.25rem;
    height: 3.25rem;
  }
}
</style>
