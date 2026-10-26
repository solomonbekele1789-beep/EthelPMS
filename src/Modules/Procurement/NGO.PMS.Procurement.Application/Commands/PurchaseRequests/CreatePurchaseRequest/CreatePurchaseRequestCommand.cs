using MediatR;
using NGO.PMS.Procurement.Domain.Enums;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.CreatePurchaseRequest;

public sealed record CreatePurchaseRequestCommand(
    string ReferenceNumber,
    Guid ProjectId,
    string Justification,
    ProcurementMethod Method,
    Guid? ProcurementPlanItemId) : IRequest<Guid>;
