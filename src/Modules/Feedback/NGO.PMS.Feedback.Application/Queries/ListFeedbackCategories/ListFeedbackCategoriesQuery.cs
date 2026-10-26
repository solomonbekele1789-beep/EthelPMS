using MediatR;
using NGO.PMS.Feedback.Application.DTOs;

namespace NGO.PMS.Feedback.Application.Queries.ListFeedbackCategories;

public sealed record ListFeedbackCategoriesQuery() : IRequest<List<FeedbackCategoryDto>>;
