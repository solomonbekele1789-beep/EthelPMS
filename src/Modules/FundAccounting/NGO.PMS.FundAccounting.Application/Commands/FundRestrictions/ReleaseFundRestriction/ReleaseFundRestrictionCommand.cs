using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Commands.FundRestrictions.ReleaseFundRestriction;

public sealed record ReleaseFundRestrictionCommand(
    Guid FundRestrictionId,
    decimal Amount) : IRequest<Unit>;

public sealed class ReleaseFundRestrictionCommandHandler
    : IRequestHandler<ReleaseFundRestrictionCommand, Unit>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ReleaseFundRestrictionCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        ReleaseFundRestrictionCommand request,
        CancellationToken cancellationToken)
    {
        var restriction = await _db.FundRestrictions
            .FirstOrDefaultAsync(x => x.Id == request.FundRestrictionId
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.FundRestriction), request.FundRestrictionId);

        restriction.Release(request.Amount);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
