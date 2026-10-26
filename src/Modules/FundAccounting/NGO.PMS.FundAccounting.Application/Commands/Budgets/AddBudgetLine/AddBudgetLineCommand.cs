using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Commands.Budgets.AddBudgetLine;

public sealed record AddBudgetLineCommand(
    Guid BudgetId,
    Guid AccountId,
    string Description,
    decimal Q1Amount,
    decimal Q2Amount,
    decimal Q3Amount,
    decimal Q4Amount) : IRequest<Guid>;

public sealed class AddBudgetLineCommandHandler
    : IRequestHandler<AddBudgetLineCommand, Guid>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddBudgetLineCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        AddBudgetLineCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.Budgets
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == request.BudgetId
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Budget), request.BudgetId);

        budget.AddLine(
            request.AccountId,
            request.Description,
            request.Q1Amount,
            request.Q2Amount,
            request.Q3Amount,
            request.Q4Amount);

        await _db.SaveChangesAsync(cancellationToken);

        return budget.Lines[^1].Id;
    }
}
