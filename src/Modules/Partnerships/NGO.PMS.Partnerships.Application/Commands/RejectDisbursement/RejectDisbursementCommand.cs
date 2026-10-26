using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.RejectDisbursement;

public sealed record RejectDisbursementCommand(Guid Id) : IRequest<Unit>;
