<template>
  <div class="organization-page">
    <PageHeader title="組織管理" />

    <nav class="tab-nav">
      <router-link to="/organization/departments" class="tab-link" active-class="tab-link--active">
        部門管理
      </router-link>
      <router-link to="/organization/staff" class="tab-link" active-class="tab-link--active">
        人員管理
      </router-link>
    </nav>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue';
</script>

<style scoped>
.organization-page {
  max-width: 1400px;
  padding: 2rem;
  margin: 0 auto;
}

.tab-nav {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-primary);
}

.tab-link {
  padding: 0.625rem 1.25rem;
  margin-bottom: -2px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.tab-link:hover {
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.tab-link--active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
</style>
