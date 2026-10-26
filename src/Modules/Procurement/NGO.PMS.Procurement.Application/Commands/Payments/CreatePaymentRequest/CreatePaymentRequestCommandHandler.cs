using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.Payments.CreatePaymentRequest;

public sealed class CreatePaymentRequestCommandHandler : IRequestHandler<CreatePaymentRequestCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePaymentRequestCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreatePaymentRequestCommand request, CancellationToken ct)
    {
        var payment = PaymentRequest.Create(
            request.ReferenceNumber,
            request.SupplierInvoiceId,
            request.ProjectId,
            request.Amount,
            _currentUser.OrganizationId);

        _db.PaymentRequests.Add(payment);
        await _db.SaveChangesAsync(ct);
        return payment.Id;
    }
}
