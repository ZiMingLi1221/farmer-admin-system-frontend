/**
 * HTTP 請求客戶端
 * 統一封裝 axios，提供請求 / 回應攔截器
 *
 * 功能：
 *  - 自動附加 Bearer Token
 *  - 業務碼（code !== 0）攔截，統一 reject
 *  - HTTP 4xx / 5xx 錯誤分類處理
 *  - 401 自動清除 Token 並跳轉登入頁
 *  - DEV 環境才輸出 console.error（生產環境靜默）
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { API_BASE_URL, API_VERSION } from '@/config';
import type { ApiResponse } from '@/types';

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      // 含版本前綴：http://localhost:3000/api/v1
      baseURL: `${API_BASE_URL}/${API_VERSION}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 設置請求 / 回應攔截器
   */
  private setupInterceptors(): void {
    // ── 請求攔截器：自動附加 Authorization header ────────────────────
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ── 回應攔截器：業務碼與 HTTP 錯誤分流處理 ────────────────────────
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;

        // 業務碼非 0 視為業務層錯誤（HTTP 本身可能是 2xx）
        if (data.code !== 0) {
          if (import.meta.env.DEV) {
            console.error(`[API 業務錯誤] code=${data.code}`, data.message);
          }
          return Promise.reject(new Error(data.message || '請求失敗'));
        }

        return response;
      },
      (error) => {
        if (error.response) {
          // 伺服器有回應，但為 4xx / 5xx
          const { status } = error.response;
          this.handleHttpError(status);
        } else if (error.request) {
          // 請求已送出但無回應（網路斷線、timeout）
          if (import.meta.env.DEV) {
            console.error('[API 網路錯誤] 請求已送出但未收到回應，請檢查網路連線');
          }
        } else {
          // axios 設定階段即發生錯誤
          if (import.meta.env.DEV) {
            console.error('[API 設定錯誤]', error.message);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 根據 HTTP 狀態碼分類處理錯誤
   * DEV 環境才輸出 console.error；生產環境由上層 UI 處理通知
   */
  private handleHttpError(status: number): void {
    switch (status) {
      case 401:
        // Token 無效或過期：清除本地憑證，跳轉登入頁
        localStorage.removeItem('auth_token');
        // 使用 lazy import 避免與 router 產生循環依賴
        import('@/router').then(({ default: router }) => {
          router.push('/login');
        });
        break;

      case 403:
        if (import.meta.env.DEV) {
          console.error('[API 403] 無權限存取此資源');
        }
        break;

      case 404:
        if (import.meta.env.DEV) {
          console.error('[API 404] 請求的資源不存在');
        }
        break;

      case 500:
        if (import.meta.env.DEV) {
          console.error('[API 500] 伺服器內部錯誤');
        }
        break;

      default:
        if (import.meta.env.DEV) {
          console.error(`[API ${status}] 請求失敗`);
        }
    }
  }

  /**
   * GET 請求
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST 請求
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT 請求（整體替換）
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE 請求
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * PATCH 請求（部分更新）
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
}

// 全域單例，統一使用此實例發送請求
export const httpClient = new HttpClient();
