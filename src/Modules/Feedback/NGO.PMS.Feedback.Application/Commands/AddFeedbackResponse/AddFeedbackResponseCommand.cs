using MediatR;

namespace NGO.PMS.Feedback.Application.Commands.AddFeedbackResponse;

public sealed record AddFeedbackResponseCommand(
    Guid FeedbackItemId,
    string Content,
    bool IsInternal) : IRequest<Guid>;
