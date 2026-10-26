using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Commands.Budgets.ApproveBudget;

public sealed record ApproveBudgetCommand(
    Guid BudgetId) : IRequest<Unit>;

public sealed class ApproveBudgetCommandHandler
    : IRequestHandler<ApproveBudgetCommand, Unit>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApproveBudgetCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        ApproveBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.Budgets
            .FirstOrDefaultAsync(x => x.Id == request.BudgetId
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Budget), request.BudgetId);

        budget.Approve(_currentUser.UserId);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
