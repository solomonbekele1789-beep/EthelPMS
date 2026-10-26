using MediatR;
using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Application.Commands.SubmitFeedback;

public sealed record SubmitFeedbackCommand(
    Guid? FeedbackCategoryId,
    FeedbackType Type,
    FeedbackPriority Priority,
    FeedbackChannel Channel,
    string Description,
    string? SubmitterName,
    string? SubmitterContact,
    bool IsAnonymous,
    bool IsConfidential,
    string? Location,
    Guid? ProjectId) : IRequest<Guid>;
