using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.SubmitPurchaseRequest;

public sealed record SubmitPurchaseRequestCommand(Guid RequestId) : IRequest<Unit>;
