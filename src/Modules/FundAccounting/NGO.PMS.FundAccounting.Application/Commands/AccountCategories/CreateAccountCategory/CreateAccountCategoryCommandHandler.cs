using MediatR;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Commands.AccountCategories.CreateAccountCategory;

public sealed class CreateAccountCategoryCommandHandler
    : IRequestHandler<CreateAccountCategoryCommand, Guid>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateAccountCategoryCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CreateAccountCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = AccountCategory.Create(
            request.Code,
            request.Name,
            request.AccountType,
            request.SortOrder,
            _currentUser.OrganizationId);

        if (request.ParentCategoryId.HasValue)
            category.SetParent(request.ParentCategoryId);

        _db.AccountCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}
