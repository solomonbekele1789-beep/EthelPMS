using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.ApproveDisbursement;

public sealed record ApproveDisbursementCommand(Guid Id) : IRequest<Unit>;
