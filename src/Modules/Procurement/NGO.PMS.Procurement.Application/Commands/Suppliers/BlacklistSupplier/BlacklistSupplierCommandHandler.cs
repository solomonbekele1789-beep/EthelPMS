using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.BlacklistSupplier;

public sealed class BlacklistSupplierCommandHandler : IRequestHandler<BlacklistSupplierCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public BlacklistSupplierCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(BlacklistSupplierCommand request, CancellationToken ct)
    {
        var supplier = await _db.Suppliers
            .FirstOrDefaultAsync(s => s.OrganizationId == _currentUser.OrganizationId && s.Id == request.SupplierId, ct)
            ?? throw new BusinessRuleException("Supplier not found.");

        supplier.Blacklist(request.Reason);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
