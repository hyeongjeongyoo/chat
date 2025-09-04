"use client";

import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import {
  Box,
  Stack,
  Text,
  Button,
  Textarea,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { Edit, Trash2 } from "lucide-react";
import {
  getBbsComments,
  createBbsComment,
  deleteBbsComment,
  updateBbsComment,
} from "@/lib/api/bbs-comment";
import type { BbsComment } from "@/types/bbs-comment";
import { format } from "date-fns";
import { authState } from "@/stores/auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface AdminCommentProps {
  nttId: number;
  isReadOnly?: boolean;
}

export function AdminComment({ nttId, isReadOnly = false }: AdminCommentProps) {
  const { user } = useRecoilValue(authState);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN";

  const [comments, setComments] = useState<BbsComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const fetchComments = async () => {
    try {
      const data = await getBbsComments(nttId);
      setComments(data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setComments([]); // 댓글이 없으면 빈 배열로 설정
      } else {
        console.error("Failed to fetch comments:", error);
        // alert("답변을 불러오는데 실패했습니다."); // alert 제거
      }
    }
  };

  useEffect(() => {
    if (nttId) {
      fetchComments();
    }
  }, [nttId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBbsComment(nttId, newComment, "아르피나");
      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("답변 작성에 실패했습니다. 개발자 콘솔을 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (commentId: number) => {
    setCommentToDelete(commentId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeleting(commentToDelete);
    try {
      await deleteBbsComment(nttId, commentToDelete);
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("답변 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(null);
      setCommentToDelete(null);
      setConfirmOpen(false);
    }
  };

  const handleEdit = (comment: BbsComment) => {
    setEditingCommentId(comment.commentId);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleUpdate = async (commentId: number) => {
    if (!editingContent.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }
    setIsUpdating(true);
    try {
      await updateBbsComment(nttId, commentId, editingContent, "아르피나");
      handleCancelEdit();
      await fetchComments();
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("답변 수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        답변 {comments.length > 0 && `(${comments.length})`}
      </Text>

      {/* 댓글 목록 */}
      <Stack gap={4} mb={6}>
        {comments.length === 0 && !isSubmitting && !isAdmin ? (
          <Text>등록된 답변이 없습니다.</Text>
        ) : comments.length === 0 && isAdmin ? (
          <Text>첫 번째 답변을 작성해주세요.</Text>
        ) : (
          comments.map((comment) => (
            <Box
              key={comment.commentId}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="white"
            >
              {editingCommentId === comment.commentId ? (
                <Box>
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    resize="vertical"
                    minH="100px"
                    disabled={isUpdating}
                  />
                  <Flex justify="flex-end" mt={2} gap={2}>
                    <Button
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      colorPalette="blue"
                      onClick={() => handleUpdate(comment.commentId)}
                      loading={isUpdating}
                      loadingText="저장 중"
                    >
                      저장
                    </Button>
                  </Flex>
                </Box>
              ) : (
                <>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Stack direction="row" gap={4}>
                      <Text fontWeight="bold">
                        {comment.displayWriter || comment.writer}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        {format(
                          new Date(comment.createdAt),
                          "yyyy-MM-dd HH:mm:ss"
                        )}
                      </Text>
                    </Stack>
                    {isAdmin && !isReadOnly && (
                      <Stack direction="row" gap={2}>
                        <IconButton
                          aria-label="Edit comment"
                          onClick={() => handleEdit(comment)}
                          size="sm"
                          variant="ghost"
                          colorPalette="gray"
                          disabled={
                            isDeleting !== null || editingCommentId !== null
                          }
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          aria-label="Delete comment"
                          onClick={() => handleDelete(comment.commentId)}
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          disabled={
                            isDeleting !== null || editingCommentId !== null
                          }
                          loading={isDeleting === comment.commentId}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    )}
                  </Flex>
                  <Text whiteSpace="pre-wrap">{comment.content}</Text>
                </>
              )}
            </Box>
          ))
        )}
      </Stack>

      {/* 댓글 작성 폼 (관리자에게만 보임) */}
      {isAdmin && !isReadOnly && (
        <Box>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="답변을 작성하세요"
            resize="vertical"
            minH="100px"
            disabled={isSubmitting}
          />
          <Flex justify="flex-end" mt={2}>
            <Button
              colorPalette="blue"
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
              loading={isSubmitting}
              loadingText="등록 중"
            >
              답변 등록
            </Button>
          </Flex>
        </Box>
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="답변 삭제"
        description="정말로 이 답변을 삭제하시겠습니까?"
        isLoading={isDeleting !== null}
      />
    </Box>
  );
}
