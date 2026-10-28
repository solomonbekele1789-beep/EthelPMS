using MediatR;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Domain.Entities;

namespace NGO.PMS.Feedback.Application.Commands.CreateFeedbackCategory;

public sealed class CreateFeedbackCategoryCommandHandler : IRequestHandler<CreateFeedbackCategoryCommand, Guid>
{
    private readonly IFeedbackDbContext _db;

    public CreateFeedbackCategoryCommandHandler(IFeedbackDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(CreateFeedbackCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = FeedbackCategory.Create(
            request.Name,
            request.Description,
            request.DefaultType,
            request.SlaResponseDays,
            request.SlaResolutionDays,
            request.RequiresEscalation,
            request.SortOrder);

        _db.FeedbackCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}
