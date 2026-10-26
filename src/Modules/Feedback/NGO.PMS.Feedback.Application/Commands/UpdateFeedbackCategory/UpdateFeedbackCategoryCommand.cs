using MediatR;
using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Application.Commands.UpdateFeedbackCategory;

public sealed record UpdateFeedbackCategoryCommand(
    Guid Id,
    string Name,
    string? Description,
    FeedbackType DefaultType,
    int SlaResponseDays,
    int SlaResolutionDays,
    bool RequiresEscalation,
    int SortOrder) : IRequest<Guid>;
