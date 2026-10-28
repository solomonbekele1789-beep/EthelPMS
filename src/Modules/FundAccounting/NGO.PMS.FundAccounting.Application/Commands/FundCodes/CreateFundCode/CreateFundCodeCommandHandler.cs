using MediatR;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Commands.FundCodes.CreateFundCode;

public sealed class CreateFundCodeCommandHandler
    : IRequestHandler<CreateFundCodeCommand, Guid>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateFundCodeCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CreateFundCodeCommand request,
        CancellationToken cancellationToken)
    {
        var fundCode = FundCode.Create(
            request.Code,
            request.Name,
            request.FundType,
            _currentUser.OrganizationId);

        if (request.DonorGrantId.HasValue)
            fundCode.LinkToDonorGrant(request.DonorGrantId.Value);

        _db.FundCodes.Add(fundCode);
        await _db.SaveChangesAsync(cancellationToken);

        return fundCode.Id;
    }
}
