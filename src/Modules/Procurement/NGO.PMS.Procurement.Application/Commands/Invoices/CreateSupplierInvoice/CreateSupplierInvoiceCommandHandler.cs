using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.Invoices.CreateSupplierInvoice;

public sealed class CreateSupplierInvoiceCommandHandler : IRequestHandler<CreateSupplierInvoiceCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateSupplierInvoiceCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateSupplierInvoiceCommand request, CancellationToken ct)
    {
        var invoice = SupplierInvoice.Create(
            request.InvoiceNumber,
            request.SupplierId,
            request.PurchaseOrderId,
            request.InvoiceAmount,
            request.InvoiceDate,
            _currentUser.OrganizationId);

        if (request.GrnId.HasValue)
            invoice.LinkToGrn(request.GrnId.Value);

        _db.SupplierInvoices.Add(invoice);
        await _db.SaveChangesAsync(ct);
        return invoice.Id;
    }
}
