using MediatR;

namespace NGO.PMS.Chat.Application.Commands.DeleteMessage;

public sealed record DeleteMessageCommand(Guid MessageId) : IRequest<Guid>;
