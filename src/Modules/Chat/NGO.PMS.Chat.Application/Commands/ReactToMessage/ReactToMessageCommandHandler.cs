using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Commands.ReactToMessage;

public sealed class ReactToMessageCommandHandler : IRequestHandler<ReactToMessageCommand, Guid>
{
    private readonly IChatDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ReactToMessageCommandHandler(IChatDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(ReactToMessageCommand request, CancellationToken cancellationToken)
    {
        var message = await _db.ChatMessages
            .FirstOrDefaultAsync(m => m.Id == request.MessageId, cancellationToken)
            ?? throw new InvalidOperationException($"Message {request.MessageId} not found.");

        message.AddReaction(request.Emoji);
        await _db.SaveChangesAsync(cancellationToken);

        return message.Id;
    }
}
