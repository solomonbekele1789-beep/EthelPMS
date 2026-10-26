using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.ActivateSubGrantee;

public sealed record ActivateSubGranteeCommand(Guid Id) : IRequest<Unit>;
