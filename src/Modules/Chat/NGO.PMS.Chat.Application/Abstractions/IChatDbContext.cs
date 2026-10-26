using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Chat.Application.Abstractions;

public interface IChatDbContext
{
    DbSet<ChatRoom> ChatRooms { get; }
    DbSet<ChatParticipant> ChatParticipants { get; }
    DbSet<ChatMessage> ChatMessages { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
