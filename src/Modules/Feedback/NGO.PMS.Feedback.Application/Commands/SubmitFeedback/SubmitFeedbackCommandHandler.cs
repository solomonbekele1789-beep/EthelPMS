using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Application.Commands.SubmitFeedback;

public sealed class SubmitFeedbackCommandHandler : IRequestHandler<SubmitFeedbackCommand, Guid>
{
    private readonly IFeedbackDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SubmitFeedbackCommandHandler(IFeedbackDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        // Determine SLA from category if provided, otherwise use defaults
        var slaResponseDays = 5;
        var slaResolutionDays = 30;

        if (request.FeedbackCategoryId.HasValue)
        {
            var category = await _db.FeedbackCategories
                .FirstOrDefaultAsync(c => c.Id == request.FeedbackCategoryId.Value, cancellationToken);

            if (category is not null)
            {
                slaResponseDays = category.SlaResponseDays;
                slaResolutionDays = category.SlaResolutionDays;
            }
        }

        // Generate reference number
        var count = await _db.FeedbackItems.CountAsync(cancellationToken);
        var referenceNumber = $"ETHEL-F-{(count + 1):D6}";

        // Determine submitter user ID (null if anonymous or not authenticated)
        Guid? submitterUserId = request.IsAnonymous ? null : (_currentUser.IsAuthenticated ? _currentUser.UserId : null);

        var item = FeedbackItem.Create(
            referenceNumber,
            request.Type,
            request.Priority,
            request.Channel,
            request.Description,
            request.SubmitterName,
            request.SubmitterContact,
            submitterUserId,
            request.IsAnonymous,
            request.IsConfidential,
            request.Location,
            request.ProjectId,
            request.FeedbackCategoryId,
            slaResponseDays,
            slaResolutionDays);

        _db.FeedbackItems.Add(item);
        await _db.SaveChangesAsync(cancellationToken);

        return item.Id;
    }
}
