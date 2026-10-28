using MediatR;

namespace NGO.PMS.Chat.Application.Commands.ReactToMessage;

public sealed record ReactToMessageCommand(Guid MessageId, string Emoji) : IRequest<Guid>;
