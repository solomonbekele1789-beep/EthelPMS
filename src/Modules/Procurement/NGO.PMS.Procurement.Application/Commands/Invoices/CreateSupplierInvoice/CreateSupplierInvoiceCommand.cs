using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.Invoices.CreateSupplierInvoice;

public sealed record CreateSupplierInvoiceCommand(
    string InvoiceNumber,
    Guid SupplierId,
    Guid PurchaseOrderId,
    decimal InvoiceAmount,
    DateTime InvoiceDate,
    DateTime? DueDate,
    Guid? GrnId) : IRequest<Guid>;
