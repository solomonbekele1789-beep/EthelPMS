using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.DisburseFunds;

public sealed record DisburseFundsCommand(Guid Id) : IRequest<Unit>;
