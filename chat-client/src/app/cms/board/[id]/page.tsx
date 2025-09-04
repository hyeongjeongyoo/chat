"use client";

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { boardApi, boardKeys } from "@/lib/api/board";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";
import { Post, PostData } from "@/types/api";
import { PostEditor } from "../components/PostEditor";
import { PostDetail } from "../components/PostDetail";
import { PostList } from "../components/PostList";

export default function PostManagementPage() {
  const colors = useColors();
  const params = useParams();
  const boardId = Number(params.id);
  const queryClient = useQueryClient();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loadingPostId, setLoadingPostId] = useState<number | null>(null);

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: boardKeys.posts(boardId),
    queryFn: () => boardApi.getPosts(boardId),
  });

  const createPostMutation = useMutation({
    mutationFn: boardApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.posts(boardId) });
      toaster.create({
        title: "게시글이 생성되었습니다.",
        type: "success",
      });
      setIsEditorOpen(false);
      setSelectedPost(null);
    },
    onError: () => {
      toaster.create({
        title: "게시글 생성에 실패했습니다.",
        type: "error",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, postData }: { id: number; postData: Partial<Post> }) =>
      boardApi.updatePost(boardId, id, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.posts(boardId) });
      toaster.create({
        title: "게시글이 수정되었습니다.",
        type: "success",
      });
      setIsEditorOpen(false);
      setSelectedPost(null);
    },
    onError: () => {
      toaster.create({
        title: "게시글 수정에 실패했습니다.",
        type: "error",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => boardApi.deletePost(boardId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.posts(boardId) });
      toaster.create({
        title: "게시글이 삭제되었습니다.",
        type: "success",
      });
      setSelectedPost(null);
    },
    onError: () => {
      toaster.create({
        title: "게시글 삭제에 실패했습니다.",
        type: "error",
      });
    },
  });

  const handleAddPost = () => {
    setSelectedPost(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setIsEditorOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      setLoadingPostId(postId);
      await deletePostMutation.mutateAsync(postId);
    } finally {
      setLoadingPostId(null);
    }
  };

  const handleViewPost = (postId: number) => {
    const post = posts?.data.content.find((p: Post) => p.nttId === postId);
    if (post) {
      setSelectedPost(post);
      setIsEditorOpen(false);
    }
  };

  const handleSubmit = async (postData: PostData) => {
    try {
      if (selectedPost) {
        await updatePostMutation.mutateAsync({
          id: selectedPost.nttId,
          postData: postData as unknown as Partial<Post>,
        });
      } else {
        const dataToSend = {
          ...postData,
          no: 0,
          hasImageInContent: false,
          hasAttachment: false,
          displayWriter: postData.displayWriter || postData.writer,
          postedAt: postData.postedAt || new Date().toISOString(),
        };
        await createPostMutation.mutateAsync(
          dataToSend as unknown as Omit<Post, "createdAt" | "updatedAt">
        );
      }
    } finally {
      setLoadingPostId(null);
    }
  };

  const handleCancel = () => {
    setSelectedPost(null);
    setIsEditorOpen(false);
  };

  if (isPostsLoading) {
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Box>
    );
  }

  return (
    <Box>
      {isEditorOpen ? (
        <PostEditor
          boardId={boardId}
          post={selectedPost}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loadingPostId !== null}
        />
      ) : selectedPost ? (
        <PostDetail
          post={selectedPost}
          onEdit={() => handleEditPost(selectedPost)}
          onDelete={() => handleDeletePost(selectedPost.nttId)}
        />
      ) : (
        <PostList
          bbsId={boardId}
          posts={posts?.data.content || []}
          onAddPost={handleAddPost}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          onViewPost={handleViewPost}
          isLoading={isPostsLoading}
          loadingNttId={loadingPostId}
        />
      )}
    </Box>
  );
}
