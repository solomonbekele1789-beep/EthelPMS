using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Commands.Budgets.SubmitBudget;

public sealed record SubmitBudgetCommand(
    Guid BudgetId) : IRequest<Unit>;

public sealed class SubmitBudgetCommandHandler
    : IRequestHandler<SubmitBudgetCommand, Unit>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SubmitBudgetCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        SubmitBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.Budgets
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == request.BudgetId
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Budget), request.BudgetId);

        budget.Submit();
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
