using MediatR;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Application.Commands.AddFeedbackResponse;

public sealed class AddFeedbackResponseCommandHandler : IRequestHandler<AddFeedbackResponseCommand, Guid>
{
    private readonly IFeedbackDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddFeedbackResponseCommandHandler(IFeedbackDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddFeedbackResponseCommand request, CancellationToken cancellationToken)
    {
        var item = await _db.FeedbackItems.FindAsync([request.FeedbackItemId], cancellationToken)
            ?? throw new KeyNotFoundException($"Feedback item {request.FeedbackItemId} not found.");

        var response = FeedbackResponse.Create(
            request.FeedbackItemId,
            _currentUser.UserId,
            _currentUser.FullName,
            request.Content,
            request.IsInternal);

        _db.FeedbackResponses.Add(response);
        await _db.SaveChangesAsync(cancellationToken);

        return response.Id;
    }
}
