using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.RateSupplier;

public sealed class RateSupplierCommandHandler : IRequestHandler<RateSupplierCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RateSupplierCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(RateSupplierCommand request, CancellationToken ct)
    {
        var supplier = await _db.Suppliers
            .FirstOrDefaultAsync(s => s.OrganizationId == _currentUser.OrganizationId && s.Id == request.SupplierId, ct)
            ?? throw new BusinessRuleException("Supplier not found.");

        supplier.Rate(request.Score);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
