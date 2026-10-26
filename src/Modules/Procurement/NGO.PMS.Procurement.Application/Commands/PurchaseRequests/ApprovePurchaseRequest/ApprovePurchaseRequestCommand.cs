using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.ApprovePurchaseRequest;

public sealed record ApprovePurchaseRequestCommand(Guid RequestId) : IRequest<Unit>;
