using MediatR;
using NGO.PMS.Feedback.Application.DTOs;
using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Application.Queries.ListFeedbackItems;

public sealed record ListFeedbackItemsQuery(
    FeedbackStatus? Status,
    FeedbackType? Type,
    Guid? FeedbackCategoryId,
    Guid? ProjectId,
    bool? IsConfidential,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<FeedbackItemDto>>;
