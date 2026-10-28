using MediatR;

namespace NGO.PMS.Feedback.Application.Commands.EscalateFeedback;

public sealed record EscalateFeedbackCommand(
    Guid FeedbackItemId,
    string Reason) : IRequest<Guid>;
