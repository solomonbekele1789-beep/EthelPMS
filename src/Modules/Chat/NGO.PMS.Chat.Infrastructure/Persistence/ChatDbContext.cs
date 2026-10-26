using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.Chat.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Chat.Infrastructure.Persistence;

public class ChatDbContext : MultiTenantDbContext, IChatDbContext
{
    public DbSet<ChatRoom> ChatRooms => Set<ChatRoom>();
    public DbSet<ChatParticipant> ChatParticipants => Set<ChatParticipant>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public ChatDbContext(DbContextOptions<ChatDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("collab");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ChatDbContext).Assembly);
        modelBuilder.Entity<OutboxMessage>().ToTable("chat_outbox_messages");
    }
}
