using MediatR;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Commands.Budgets.CreateBudget;

public sealed class CreateBudgetCommandHandler
    : IRequestHandler<CreateBudgetCommand, Guid>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBudgetCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CreateBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var budget = Budget.Create(
            request.Title,
            request.ProjectId,
            request.FiscalYear,
            request.CurrencyCode,
            request.ExchangeRate,
            _currentUser.OrganizationId);

        _db.Budgets.Add(budget);
        await _db.SaveChangesAsync(cancellationToken);

        return budget.Id;
    }
}
