using MediatR;
using NGO.PMS.Feedback.Application.DTOs;

namespace NGO.PMS.Feedback.Application.Queries.GetFeedbackItem;

public sealed record GetFeedbackItemQuery(Guid FeedbackItemId) : IRequest<FeedbackItemDto>;
