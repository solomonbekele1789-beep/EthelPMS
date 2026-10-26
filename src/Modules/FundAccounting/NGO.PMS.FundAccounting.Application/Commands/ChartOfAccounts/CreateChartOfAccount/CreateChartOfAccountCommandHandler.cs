using MediatR;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Commands.ChartOfAccounts.CreateChartOfAccount;

public sealed class CreateChartOfAccountCommandHandler
    : IRequestHandler<CreateChartOfAccountCommand, Guid>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateChartOfAccountCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CreateChartOfAccountCommand request,
        CancellationToken cancellationToken)
    {
        var account = ChartOfAccount.Create(
            request.AccountCode,
            request.AccountName,
            request.AccountType,
            request.AccountCategoryId,
            _currentUser.OrganizationId);

        _db.ChartOfAccounts.Add(account);
        await _db.SaveChangesAsync(cancellationToken);

        return account.Id;
    }
}
