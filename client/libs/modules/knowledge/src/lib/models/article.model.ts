export type ArticleType = 'LessonLearned' | 'BestPractice' | 'EvaluationFinding' | 'CaseStudy' | 'Guideline' | 'Template';

export type ArticleStatus = 'Draft' | 'Published' | 'Archived';

export interface KbArticleDto {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  content: string;
  summary?: string;
  authorId: string;
  tags: string[];
  linkedProjectId?: string;
  linkedEvaluationId?: string;
  articleType: ArticleType;
  status: ArticleStatus;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
}

export interface KbArticleListDto {
  id: string;
  title: string;
  summary?: string;
  articleType: ArticleType;
  status: ArticleStatus;
  categoryName: string;
  authorId: string;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
}

export interface CreateArticleRequest {
  categoryId: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  linkedProjectId?: string;
  linkedEvaluationId?: string;
  articleType: ArticleType;
}

export interface UpdateArticleRequest {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  isFeatured?: boolean;
}
