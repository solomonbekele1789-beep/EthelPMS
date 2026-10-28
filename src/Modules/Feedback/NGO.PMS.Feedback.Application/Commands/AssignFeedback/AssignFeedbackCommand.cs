using MediatR;

namespace NGO.PMS.Feedback.Application.Commands.AssignFeedback;

public sealed record AssignFeedbackCommand(
    Guid FeedbackItemId,
    Guid AssignedToUserId,
    string AssignedToName) : IRequest<Guid>;
