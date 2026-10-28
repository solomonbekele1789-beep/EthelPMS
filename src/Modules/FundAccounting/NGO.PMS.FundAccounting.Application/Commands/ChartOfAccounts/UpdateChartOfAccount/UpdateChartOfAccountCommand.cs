using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Commands.ChartOfAccounts.UpdateChartOfAccount;

public sealed record UpdateChartOfAccountCommand(
    Guid Id,
    string AccountName,
    string? Description) : IRequest<Unit>;

public sealed class UpdateChartOfAccountCommandHandler
    : IRequestHandler<UpdateChartOfAccountCommand, Unit>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateChartOfAccountCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        UpdateChartOfAccountCommand request,
        CancellationToken cancellationToken)
    {
        var account = await _db.ChartOfAccounts
            .FirstOrDefaultAsync(x => x.Id == request.Id
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.ChartOfAccount), request.Id);

        account.Update(request.AccountName, request.Description);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
