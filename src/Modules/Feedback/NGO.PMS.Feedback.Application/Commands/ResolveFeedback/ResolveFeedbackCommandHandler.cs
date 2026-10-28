using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Application.Abstractions;

namespace NGO.PMS.Feedback.Application.Commands.ResolveFeedback;

public sealed class ResolveFeedbackCommandHandler : IRequestHandler<ResolveFeedbackCommand, Guid>
{
    private readonly IFeedbackDbContext _db;

    public ResolveFeedbackCommandHandler(IFeedbackDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(ResolveFeedbackCommand request, CancellationToken cancellationToken)
    {
        var item = await _db.FeedbackItems
            .Include(f => f.Responses)
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackItemId, cancellationToken)
            ?? throw new KeyNotFoundException($"Feedback item {request.FeedbackItemId} not found.");

        item.Resolve();
        await _db.SaveChangesAsync(cancellationToken);

        return item.Id;
    }
}
