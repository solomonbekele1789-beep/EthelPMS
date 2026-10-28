using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.AddPurchaseRequestItem;

public sealed record AddPurchaseRequestItemCommand(
    Guid RequestId,
    string Description,
    decimal Quantity,
    string Unit,
    decimal EstimatedUnitCost,
    string? Specification) : IRequest<Guid>;
