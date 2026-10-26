using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.Commands.CreateAccessKey;

public record CreateAccessKeyCommand(
    Guid TenantId,
    string Label,
    string[] Scopes,
    DateTimeOffset? ExpiresAt) : IRequest<string>;
