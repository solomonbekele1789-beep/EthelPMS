using MediatR;
using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Application.Commands.CreateFeedbackCategory;

public sealed record CreateFeedbackCategoryCommand(
    string Name,
    string? Description,
    FeedbackType DefaultType,
    int SlaResponseDays,
    int SlaResolutionDays,
    bool RequiresEscalation,
    int SortOrder) : IRequest<Guid>;
