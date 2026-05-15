<template>
  <main class="main-content" :style="mainLayoutStyles">
    <div class="main-scroll">
      <router-view />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useSidebarStore } from '@/stores/sidebar';

interface Props {
  hasHeader?: boolean;
  isMobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasHeader: false,
  isMobile: false,
});

const route = useRoute();
const sidebarStore = useSidebarStore();
const isSwitchingRoute = ref(false);

// 路由切換時暫停動畫，防止 margin/width 擠壓閃爍
watch(
  () => route.path,
  () => {
    isSwitchingRoute.value = true;
    setTimeout(() => {
      isSwitchingRoute.value = false;
    }, 100);
  }
);

const mainLayoutStyles = computed(() => {
  const paddingTop = props.hasHeader ? '4rem' : '0';

  if (props.isMobile) {
    return {
      marginLeft: '0',
      width: '100%',
      paddingTop,
      transition: 'none',
    };
  }

  const mainWidth = sidebarStore.isCollapsed ? 64 : sidebarStore.displayWidth;
  const marginLeft = `${mainWidth}px`;
  const width = `calc(100% - ${marginLeft})`;
  const isResizing = sidebarStore.liveSidebarWidth !== null;

  return {
    marginLeft,
    width,
    paddingTop,
    transition:
      isSwitchingRoute.value || isResizing
        ? 'none'
        : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };
});
</script>

<style scoped>
.main-content {
  box-sizing: border-box;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg);
  border-radius: var(--r-2xl);
  box-shadow: var(--shadow-1);

  /* 動態 transition, marginLeft 與 width 由 script 邏輯與 inline style 控制 */
}

.main-scroll {
  height: 100%;
  overflow: hidden auto;
}
</style>
