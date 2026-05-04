<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AsideLayout from './aside/index.vue';
import HeaderLayout from './header/index.vue';
import MainLayout from './main/index.vue';

const route = useRoute();

// 需要 Header 的路由（目前僅 chat）
const showHeader = computed(() => {
  return route.path === '/chat' || route.path.startsWith('/chat/');
});
</script>

<template>
  <div class="layout-container">
    <!-- 側邊欄 -->
    <AsideLayout />

    <!-- Header（僅 chat 顯示） -->
    <HeaderLayout v-if="showHeader" />

    <!-- 主內容區 -->
    <MainLayout :has-header="showHeader" />
  </div>
</template>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-primary);
}
</style>
