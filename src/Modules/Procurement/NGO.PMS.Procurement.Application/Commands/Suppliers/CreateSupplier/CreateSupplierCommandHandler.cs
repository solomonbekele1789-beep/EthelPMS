using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.CreateSupplier;

public sealed class CreateSupplierCommandHandler : IRequestHandler<CreateSupplierCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateSupplierCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateSupplierCommand request, CancellationToken ct)
    {
        var supplier = Supplier.Create(request.Name, request.ContactPerson, request.Email, _currentUser.OrganizationId);

        if (request.Phone is not null || request.Address is not null || request.TaxIdNumber is not null)
            supplier.UpdateDetails(request.Name, request.ContactPerson, request.Email, request.Phone, request.Address, request.TaxIdNumber);

        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync(ct);
        return supplier.Id;
    }
}
