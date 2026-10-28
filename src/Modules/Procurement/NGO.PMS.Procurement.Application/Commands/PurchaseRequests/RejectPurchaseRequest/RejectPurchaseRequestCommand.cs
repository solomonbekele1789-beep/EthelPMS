using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.RejectPurchaseRequest;

public sealed record RejectPurchaseRequestCommand(Guid RequestId, string Reason) : IRequest<Unit>;
