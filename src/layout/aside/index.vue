<script setup lang="ts">
import MainSidebar from './MainSidebar.vue';
</script>

<template>
  <aside class="sidebar-container">
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
</style>
