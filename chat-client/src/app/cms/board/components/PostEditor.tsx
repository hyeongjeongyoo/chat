"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Input,
  Textarea,
  Button,
  Flex,
  Checkbox,
  Field,
  Fieldset,
  HStack,
} from "@chakra-ui/react";
import { Post, PostData, ArticleStatusFlag } from "@/types/api";
import { CheckIcon } from "lucide-react";

interface PostEditorProps {
  boardId: number;
  post: Post | null;
  categories?: string[];
  onSubmit: (postData: PostData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function PostEditor({
  boardId,
  post,
  categories = [],
  onSubmit,
  onCancel,
  isLoading,
}: PostEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostData>({
    no: 0,
    bbsId: boardId,
    title: "",
    content: "",
    writer: "",
    displayWriter: "",
    publishStartDt: new Date().toISOString(),
    noticeState: "N",
    noticeStartDt: new Date().toISOString(),
    noticeEndDt: new Date().toISOString(),
    publishState: "Y",
    publishEndDt: null,
    externalLink: null,
    nttId: 0,
    threadDepth: 0,
    hits: 0,
    categories: [],
    parentNttId: null,
    postedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (post) {
      setFormData({
        no: post.no,
        bbsId: post.bbsId,
        title: post.title,
        content: post.content,
        writer: post.writer,
        displayWriter: post.displayWriter,
        publishStartDt: post.publishStartDt,
        noticeState: post.noticeState as ArticleStatusFlag,
        noticeStartDt: post.noticeStartDt,
        noticeEndDt: post.noticeEndDt,
        publishState: post.publishState as ArticleStatusFlag,
        publishEndDt: post.publishEndDt,
        externalLink: post.externalLink,
        nttId: post.nttId,
        threadDepth: post.threadDepth,
        hits: post.hits,
        categories: post.categories?.map((category) => category.name) || [],
        parentNttId: post.parentNttId,
        postedAt: post.postedAt,
      });
    } else {
      setFormData({
        no: 0,
        bbsId: boardId,
        title: "",
        content: "",
        writer: "",
        displayWriter: "",
        publishStartDt: new Date().toISOString(),
        noticeState: "N",
        noticeStartDt: new Date().toISOString(),
        noticeEndDt: new Date().toISOString(),
        publishState: "Y",
        publishEndDt: null,
        externalLink: null,
        nttId: 0,
        threadDepth: 0,
        hits: 0,
        categories: [],
        parentNttId: null,
        postedAt: new Date().toISOString(),
      });
    }
  }, [post, boardId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: (prev.categories || []).includes(category)
        ? (prev.categories || []).filter((c) => c !== category)
        : [...(prev.categories || []), category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={4}>
      <form onSubmit={handleSubmit}>
        <Fieldset.Root size="lg">
          <Fieldset.Legend>게시글 {post ? "수정" : "작성"}</Fieldset.Legend>
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>제목</Field.Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
                required
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>작성자</Field.Label>
              <Input
                name="writer"
                value={formData.writer}
                onChange={handleChange}
                placeholder="작성자 이름"
                required
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>표시 작성자</Field.Label>
              <Input
                name="displayWriter"
                value={formData.displayWriter || ""}
                onChange={handleChange}
                placeholder="화면에 표시될 작성자 이름"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>내용</Field.Label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="내용을 입력하세요"
                minH="200px"
                required
              />
            </Field.Root>

            {categories.length > 0 && (
              <Field.Root>
                <Field.Label>카테고리</Field.Label>
                <HStack gap={2} wrap="wrap">
                  {categories.map((category) => (
                    <Checkbox.Root
                      key={category}
                      checked={(formData.categories || []).includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>{category}</Checkbox.Label>
                    </Checkbox.Root>
                  ))}
                </HStack>
              </Field.Root>
            )}

            <Field.Root>
              <Field.Label>게시 시작일</Field.Label>
              <Input
                type="datetime-local"
                name="publishStartDt"
                value={formData.publishStartDt}
                onChange={handleChange}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>게시일</Field.Label>
              <Input
                type="datetime-local"
                name="postedAt"
                value={formData.postedAt || ""}
                onChange={handleChange}
              />
            </Field.Root>
          </Fieldset.Content>

          <Flex justify="flex-end" gap={2}>
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              colorPalette="primary"
              loading={isSubmitting || isLoading}
            >
              <CheckIcon size={16} style={{ marginRight: "8px" }} />
              {post ? "수정" : "저장"}
            </Button>
          </Flex>
        </Fieldset.Root>
      </form>
    </Box>
  );
}
