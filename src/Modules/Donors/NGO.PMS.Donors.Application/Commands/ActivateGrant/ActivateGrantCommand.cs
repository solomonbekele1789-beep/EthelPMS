using MediatR;

namespace NGO.PMS.Donors.Application.Commands.ActivateGrant;

public sealed record ActivateGrantCommand(Guid GrantId) : IRequest<Unit>;
