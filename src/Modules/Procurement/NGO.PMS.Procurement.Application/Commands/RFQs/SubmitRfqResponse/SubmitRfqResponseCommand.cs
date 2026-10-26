using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.RFQs.SubmitRfqResponse;

public sealed record SubmitRfqResponseCommand(
    Guid RfqId,
    Guid SupplierId,
    decimal TotalQuotedAmount,
    int DeliveryDays,
    string? Notes) : IRequest<Guid>;
