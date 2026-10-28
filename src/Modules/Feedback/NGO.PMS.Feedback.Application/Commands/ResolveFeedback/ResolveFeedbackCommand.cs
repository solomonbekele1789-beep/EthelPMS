using MediatR;

namespace NGO.PMS.Feedback.Application.Commands.ResolveFeedback;

public sealed record ResolveFeedbackCommand(Guid FeedbackItemId) : IRequest<Guid>;
