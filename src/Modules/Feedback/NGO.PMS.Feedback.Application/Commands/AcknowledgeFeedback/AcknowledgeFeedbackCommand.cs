using MediatR;

namespace NGO.PMS.Feedback.Application.Commands.AcknowledgeFeedback;

public sealed record AcknowledgeFeedbackCommand(Guid FeedbackItemId) : IRequest<Guid>;
