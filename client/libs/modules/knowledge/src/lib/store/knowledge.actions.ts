import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { KbCategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';
import { KbArticleDto, KbArticleListDto, CreateArticleRequest, UpdateArticleRequest, ArticleType, ArticleStatus } from '../models/article.model';
import { KbArticleCommentDto, AddCommentRequest } from '../models/comment.model';

export const KnowledgeActions = createActionGroup({
  source: 'Knowledge',
  events: {
    // Categories
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: KbCategoryDto[] }>(),
    'Load Categories Failure': props<{ error: string }>(),
    'Create Category': props<{ request: CreateCategoryRequest }>(),
    'Create Category Success': props<{ id: string }>(),
    'Create Category Failure': props<{ error: string }>(),
    'Update Category': props<{ id: string; request: UpdateCategoryRequest }>(),
    'Update Category Success': emptyProps(),
    'Update Category Failure': props<{ error: string }>(),
    'Delete Category': props<{ id: string }>(),
    'Delete Category Success': emptyProps(),
    'Delete Category Failure': props<{ error: string }>(),

    // Articles
    'Load Articles': props<{ categoryId?: string; articleType?: ArticleType; status?: ArticleStatus; searchTerm?: string; tags?: string }>(),
    'Load Articles Success': props<{ articles: KbArticleListDto[] }>(),
    'Load Articles Failure': props<{ error: string }>(),
    'Search Articles': props<{ term: string }>(),
    'Search Articles Success': props<{ articles: KbArticleListDto[] }>(),
    'Search Articles Failure': props<{ error: string }>(),
    'Load Article': props<{ id: string }>(),
    'Load Article Success': props<{ article: KbArticleDto }>(),
    'Load Article Failure': props<{ error: string }>(),
    'Create Article': props<{ request: CreateArticleRequest }>(),
    'Create Article Success': props<{ id: string }>(),
    'Create Article Failure': props<{ error: string }>(),
    'Update Article': props<{ id: string; request: UpdateArticleRequest }>(),
    'Update Article Success': emptyProps(),
    'Update Article Failure': props<{ error: string }>(),
    'Publish Article': props<{ id: string }>(),
    'Publish Article Success': emptyProps(),
    'Publish Article Failure': props<{ error: string }>(),
    'Archive Article': props<{ id: string }>(),
    'Archive Article Success': emptyProps(),
    'Archive Article Failure': props<{ error: string }>(),
    'Delete Article': props<{ id: string }>(),
    'Delete Article Success': emptyProps(),
    'Delete Article Failure': props<{ error: string }>(),

    // Comments
    'Load Comments': props<{ articleId: string }>(),
    'Load Comments Success': props<{ comments: KbArticleCommentDto[] }>(),
    'Load Comments Failure': props<{ error: string }>(),
    'Add Comment': props<{ articleId: string; request: AddCommentRequest }>(),
    'Add Comment Success': props<{ id: string }>(),
    'Add Comment Failure': props<{ error: string }>(),
  },
});
