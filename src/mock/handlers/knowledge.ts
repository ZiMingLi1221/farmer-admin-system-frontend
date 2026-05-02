import { http, HttpResponse } from 'msw';

import type { KnowledgeDocument } from '@/types/knowledge';
import { DocumentStatus } from '@/types/knowledge';

import { mockDocuments } from '../knowledge';

export const knowledgeHandlers = [
  // 取得文件列表
  http.get('*/api/v1/knowledge/documents', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        items: mockDocuments,
        total: mockDocuments.length,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    });
  }),

  // 取得單一文件
  http.get('*/api/v1/knowledge/documents/:id', ({ params }) => {
    const document = mockDocuments.find((d) => d.id === params.id);
    if (!document) {
      return HttpResponse.json({
        code: 40001,
        message: '文件不存在或已被刪除',
        data: null,
      });
    }
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: document,
    });
  }),

  // 上傳文件
  http.post('*/api/v1/knowledge/documents', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    const now = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const newDoc: KnowledgeDocument = {
      id: `DOC${String(mockDocuments.length + 1).padStart(3, '0')}`,
      title: (body.title as string) || '新上傳文件',
      filename: (body.filename as string) || 'new_file.pdf',
      fileSize: (body.fileSize as number) || 0,
      mimeType: (body.mimeType as string) || 'application/pdf',
      category: (body.category as string) || '',
      department: (body.department as string) || '',
      tags: (body.tags as string[]) || [],
      description: (body.description as string) || '',
      uploadedBy: (body.uploadedBy as string) || '系統管理員',
      uploadedAt: now,
      updatedAt: now,
      status: DocumentStatus.PROCESSING,
      chunkCount: 0,
    };

    mockDocuments.push(newDoc);

    // 模擬向量化完成（3 秒後狀態更新為 READY，下次 fetchDocuments 即可取得最新狀態）
    setTimeout(() => {
      const index = mockDocuments.findIndex((d) => d.id === newDoc.id);
      if (index !== -1) {
        mockDocuments[index].status = DocumentStatus.READY;
        mockDocuments[index].chunkCount = Math.floor(Math.random() * 50) + 10;
      }
    }, 3000);

    return HttpResponse.json({
      code: 0,
      message: '文件上傳成功，正在處理向量化',
      data: newDoc,
    });
  }),

  // 取得分類清單
  http.get('*/api/v1/knowledge/categories', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: ['業務規章', '業務流程', '法規', '內部知識'],
    });
  }),
];
