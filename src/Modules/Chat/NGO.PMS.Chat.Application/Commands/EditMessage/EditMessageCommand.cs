using MediatR;

namespace NGO.PMS.Chat.Application.Commands.EditMessage;

public sealed record EditMessageCommand(Guid MessageId, string Content) : IRequest<Guid>;
