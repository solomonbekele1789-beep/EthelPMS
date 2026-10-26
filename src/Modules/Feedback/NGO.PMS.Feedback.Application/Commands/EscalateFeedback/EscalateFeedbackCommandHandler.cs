using MediatR;
using NGO.PMS.Feedback.Application.Abstractions;

namespace NGO.PMS.Feedback.Application.Commands.EscalateFeedback;

public sealed class EscalateFeedbackCommandHandler : IRequestHandler<EscalateFeedbackCommand, Guid>
{
    private readonly IFeedbackDbContext _db;

    public EscalateFeedbackCommandHandler(IFeedbackDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(EscalateFeedbackCommand request, CancellationToken cancellationToken)
    {
        var item = await _db.FeedbackItems.FindAsync([request.FeedbackItemId], cancellationToken)
            ?? throw new KeyNotFoundException($"Feedback item {request.FeedbackItemId} not found.");

        item.Escalate(request.Reason);
        await _db.SaveChangesAsync(cancellationToken);

        return item.Id;
    }
}
