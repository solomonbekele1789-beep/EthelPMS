export interface KbArticleCommentDto {
  id: string;
  articleId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
}

export interface AddCommentRequest {
  articleId: string;
  content: string;
  parentCommentId?: string;
}
