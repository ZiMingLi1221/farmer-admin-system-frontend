import { computed, ref } from 'vue';

export function useTableSelection<T extends { id: string }>(rows: { value: T[] } | (() => T[])) {
  const getRows = typeof rows === 'function' ? rows : () => rows.value;

  const selectedIds = ref<string[]>([]);

  const isAllSelected = computed(() => {
    const all = getRows();
    return all.length > 0 && selectedIds.value.length === all.length;
  });

  const isIndeterminate = computed(() => {
    return selectedIds.value.length > 0 && !isAllSelected.value;
  });

  function toggleAll() {
    if (isAllSelected.value) {
      selectedIds.value = [];
    } else {
      selectedIds.value = getRows().map((r) => r.id);
    }
  }

  function toggleRow(id: string) {
    const idx = selectedIds.value.indexOf(id);
    if (idx === -1) {
      selectedIds.value = [...selectedIds.value, id];
    } else {
      selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
    }
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  return { selectedIds, isAllSelected, isIndeterminate, toggleAll, toggleRow, clearSelection };
}
