using MediatR;
using NGO.PMS.Feedback.Application.Abstractions;

namespace NGO.PMS.Feedback.Application.Commands.AssignFeedback;

public sealed class AssignFeedbackCommandHandler : IRequestHandler<AssignFeedbackCommand, Guid>
{
    private readonly IFeedbackDbContext _db;

    public AssignFeedbackCommandHandler(IFeedbackDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(AssignFeedbackCommand request, CancellationToken cancellationToken)
    {
        var item = await _db.FeedbackItems.FindAsync([request.FeedbackItemId], cancellationToken)
            ?? throw new KeyNotFoundException($"Feedback item {request.FeedbackItemId} not found.");

        item.AssignTo(request.AssignedToUserId, request.AssignedToName);
        await _db.SaveChangesAsync(cancellationToken);

        return item.Id;
    }
}
