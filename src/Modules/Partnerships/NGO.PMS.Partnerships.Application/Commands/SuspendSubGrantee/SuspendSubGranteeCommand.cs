using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.SuspendSubGrantee;

public sealed record SuspendSubGranteeCommand(Guid Id) : IRequest<Unit>;
