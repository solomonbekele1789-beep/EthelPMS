using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Chat.Domain.Entities;

namespace NGO.PMS.Chat.Infrastructure.Persistence.Configurations;

public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable("chat_messages");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Content).IsRequired().HasMaxLength(4000);
        builder.Property(e => e.SenderDisplayName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.AttachmentUrl).HasMaxLength(500);
        builder.Property(e => e.AttachmentName).HasMaxLength(300);
        builder.Property(e => e.Reaction).HasMaxLength(500);
        builder.Property(e => e.TenantId).IsRequired().HasMaxLength(64);

        // Soft-delete query filter
        builder.HasQueryFilter(e => !e.IsDeleted);

        // Self-referencing for threading
        builder.HasOne<ChatMessage>()
            .WithMany()
            .HasForeignKey(e => e.ParentMessageId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(e => new { e.ChatRoomId, e.CreatedAt })
            .IsDescending(false, true)
            .HasDatabaseName("ix_chat_messages_room_created");

        builder.HasIndex(e => e.ParentMessageId).HasDatabaseName("ix_chat_messages_parent");
        builder.HasIndex(e => e.SenderUserId).HasDatabaseName("ix_chat_messages_sender");
    }
}
