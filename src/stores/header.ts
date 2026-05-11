import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface HeaderTab {
  label: string;
  to: string;
  activeClass?: string;
}

export const useHeaderStore = defineStore('header', () => {
  const tabs = ref<HeaderTab[]>([]);

  const setTabs = (newTabs: HeaderTab[]) => {
    tabs.value = newTabs;
  };

  const clearTabs = () => {
    tabs.value = [];
  };

  return { tabs, setTabs, clearTabs };
});
