using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.BidEvaluations.EvaluateBid;

public sealed record EvaluateBidCommand(
    Guid RfqId,
    Guid RfqResponseId,
    Guid SupplierId,
    decimal TechnicalScore,
    decimal FinancialScore,
    decimal TechnicalWeight,
    decimal FinancialWeight,
    string? Notes) : IRequest<Guid>;
