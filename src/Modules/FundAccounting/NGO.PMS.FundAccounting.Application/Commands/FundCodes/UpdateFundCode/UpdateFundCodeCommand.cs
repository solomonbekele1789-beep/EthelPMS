using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Commands.FundCodes.UpdateFundCode;

public sealed record UpdateFundCodeCommand(
    Guid Id,
    string Name,
    string? Description) : IRequest<Unit>;

public sealed class UpdateFundCodeCommandHandler
    : IRequestHandler<UpdateFundCodeCommand, Unit>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateFundCodeCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        UpdateFundCodeCommand request,
        CancellationToken cancellationToken)
    {
        var fundCode = await _db.FundCodes
            .FirstOrDefaultAsync(x => x.Id == request.Id
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.FundCode), request.Id);

        fundCode.Update(request.Name, request.Description);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
