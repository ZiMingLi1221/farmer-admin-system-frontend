import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

/**
 * 通用分頁 Composable
 *
 * @param items  已過濾完畢、待分頁的完整清單（Ref<T[]>）
 * @param options.pageSize  每頁筆數，預設 10
 *
 * @returns
 *   currentPage   - 當前頁碼（ref，1-based）
 *   pageSize      - 每頁筆數（ref）
 *   totalPages    - 總頁數（computed，最小為 1）
 *   paginatedItems - 當前頁的資料切片（computed）
 *   startIndex    - 當前頁第一筆的顯示序號（computed，1-based；清單為空時為 1）
 *   endIndex      - 當前頁最後一筆的顯示序號（computed）
 *   goToPage      - 跳頁函式，自動 clamp 至合法範圍
 */
export function usePagination<T>(items: Ref<T[]>, options?: { pageSize?: number }) {
  const currentPage = ref(1);
  const pageSize = ref(options?.pageSize ?? 10);

  // items 清單長度改變時重置到第 1 頁，避免停留在超出範圍的頁碼
  watch(
    () => items.value.length,
    () => {
      currentPage.value = 1;
    }
  );

  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize.value)));

  const paginatedItems = computed<T[]>(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return items.value.slice(start, start + pageSize.value);
  });

  // 1-based 起始序號；清單為空時顯示 1
  const startIndex = computed(() =>
    Math.min((currentPage.value - 1) * pageSize.value + 1, items.value.length || 1)
  );

  // 1-based 結束序號
  const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, items.value.length));

  function goToPage(page: number) {
    const clamped = Math.max(1, Math.min(page, totalPages.value));
    currentPage.value = clamped;
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    startIndex,
    endIndex,
    goToPage,
  };
}
