using MediatR;
using NGO.PMS.Feedback.Application.Abstractions;

namespace NGO.PMS.Feedback.Application.Commands.AcknowledgeFeedback;

public sealed class AcknowledgeFeedbackCommandHandler : IRequestHandler<AcknowledgeFeedbackCommand, Guid>
{
    private readonly IFeedbackDbContext _db;

    public AcknowledgeFeedbackCommandHandler(IFeedbackDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(AcknowledgeFeedbackCommand request, CancellationToken cancellationToken)
    {
        var item = await _db.FeedbackItems.FindAsync([request.FeedbackItemId], cancellationToken)
            ?? throw new KeyNotFoundException($"Feedback item {request.FeedbackItemId} not found.");

        item.Acknowledge();
        await _db.SaveChangesAsync(cancellationToken);

        return item.Id;
    }
}
