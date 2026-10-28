using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.Commands.RevokeAccessKey;

public record RevokeAccessKeyCommand(Guid KeyId) : IRequest;
