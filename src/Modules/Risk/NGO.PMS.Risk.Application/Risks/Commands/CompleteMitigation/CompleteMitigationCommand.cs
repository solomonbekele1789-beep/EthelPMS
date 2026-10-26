using MediatR;

namespace NGO.PMS.Risk.Application.Risks.Commands.CompleteMitigation;

public sealed record CompleteMitigationCommand(Guid MitigationId) : IRequest<Guid>;
