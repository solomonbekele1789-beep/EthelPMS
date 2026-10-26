using MediatR;
using NGO.PMS.Feedback.Application.Abstractions;

namespace NGO.PMS.Feedback.Application.Commands.UpdateFeedbackCategory;

public sealed class UpdateFeedbackCategoryCommandHandler : IRequestHandler<UpdateFeedbackCategoryCommand, Guid>
{
    private readonly IFeedbackDbContext _db;

    public UpdateFeedbackCategoryCommandHandler(IFeedbackDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(UpdateFeedbackCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _db.FeedbackCategories.FindAsync([request.Id], cancellationToken)
            ?? throw new KeyNotFoundException($"Feedback category {request.Id} not found.");

        category.Update(
            request.Name,
            request.Description,
            request.DefaultType,
            request.SlaResponseDays,
            request.SlaResolutionDays,
            request.RequiresEscalation,
            request.SortOrder);

        await _db.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}
