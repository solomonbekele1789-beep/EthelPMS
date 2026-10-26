using MediatR;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Commands.FundRestrictions.CreateFundRestriction;

public sealed record CreateFundRestrictionCommand(
    Guid FundCodeId,
    string Description,
    decimal OriginalAmount,
    string? ConditionDescription,
    DateTime? ExpiryDate) : IRequest<Guid>;

public sealed class CreateFundRestrictionCommandHandler
    : IRequestHandler<CreateFundRestrictionCommand, Guid>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateFundRestrictionCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CreateFundRestrictionCommand request,
        CancellationToken cancellationToken)
    {
        var restriction = FundRestriction.Create(
            request.FundCodeId,
            request.Description,
            request.OriginalAmount,
            request.ConditionDescription,
            request.ExpiryDate,
            _currentUser.OrganizationId);

        _db.FundRestrictions.Add(restriction);
        await _db.SaveChangesAsync(cancellationToken);

        return restriction.Id;
    }
}
