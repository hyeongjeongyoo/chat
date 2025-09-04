import { privateApi, publicApi } from '@/lib/api/client';
import { BbsComment } from '@/types/bbs-comment';

// 댓글 목록 조회 (Read)
export const getBbsComments = async (
  nttId: number
): Promise<BbsComment[]> => {
  const { data } = await publicApi.get(`/cms/bbs/voice/read/${nttId}/comments`);
  return data;
};

// 댓글 생성 (Create)
export const createBbsComment = async (
  nttId: number,
  content: string,
  displayWriter: string
): Promise<BbsComment> => {
  const { data } = await privateApi.post(`/cms/bbs/voice/read/${nttId}/comments`, {
    content,
    displayWriter,
  });
  return data;
};

// 댓글 수정 (Update)
export const updateBbsComment = async (
  nttId: number,
  commentId: number,
  content: string,
  displayWriter: string
): Promise<void> => {
  await privateApi.put(`/cms/bbs/voice/read/${nttId}/comments/${commentId}`, {
    content,
    displayWriter,
  });
};

// 댓글 삭제 (Delete)
export const deleteBbsComment = async (
  nttId: number,
  commentId: number
): Promise<void> => {
  await privateApi.delete(`/cms/bbs/voice/read/${nttId}/comments/${commentId}`);
};