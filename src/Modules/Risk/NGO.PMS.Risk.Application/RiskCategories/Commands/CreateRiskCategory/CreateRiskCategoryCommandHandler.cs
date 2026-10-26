using MediatR;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.Risk.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Application.RiskCategories.Commands.CreateRiskCategory;

public class CreateRiskCategoryCommandHandler : IRequestHandler<CreateRiskCategoryCommand, Guid>
{
    private readonly IRiskDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateRiskCategoryCommandHandler(IRiskDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateRiskCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = RiskCategory.Create(
            request.Name,
            _currentUser.OrganizationId,
            request.Description,
            request.Color,
            request.SortOrder);

        _db.RiskCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}
