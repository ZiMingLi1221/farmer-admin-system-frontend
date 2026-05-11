<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar';

import MainSidebar from './MainSidebar.vue';

const sidebarStore = useSidebarStore();
</script>

<template>
  <aside class="sidebar-container" :class="{ 'mobile-open': sidebarStore.isMobileDrawerOpen }">
    <MainSidebar />
  </aside>
</template>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 70;
  display: flex;
  height: 100vh;
}

@media (width <= 767px) {
  .sidebar-container {
    z-index: 80;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar-container.mobile-open {
    transform: translateX(0);
  }
}
</style>
