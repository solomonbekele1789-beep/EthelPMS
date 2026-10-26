using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.UpdateSupplier;

public sealed class UpdateSupplierCommandHandler : IRequestHandler<UpdateSupplierCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateSupplierCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(UpdateSupplierCommand request, CancellationToken ct)
    {
        var supplier = await _db.Suppliers
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Supplier not found.");

        supplier.UpdateDetails(request.Name, request.ContactPerson, request.Email, request.Phone, request.Address, request.TaxIdNumber);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
