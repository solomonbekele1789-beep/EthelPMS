using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.RFQs.CreateRfq;

public sealed record CreateRfqCommand(
    string ReferenceNumber,
    Guid PurchaseRequestId,
    DateTime Deadline,
    string? TermsAndConditions,
    int? MinimumResponses) : IRequest<Guid>;
