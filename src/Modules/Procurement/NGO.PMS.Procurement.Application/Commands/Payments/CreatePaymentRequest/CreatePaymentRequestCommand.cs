using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.Payments.CreatePaymentRequest;

public sealed record CreatePaymentRequestCommand(
    string ReferenceNumber,
    Guid SupplierInvoiceId,
    Guid ProjectId,
    decimal Amount,
    string? PaymentMethod,
    string? BankDetails) : IRequest<Guid>;
