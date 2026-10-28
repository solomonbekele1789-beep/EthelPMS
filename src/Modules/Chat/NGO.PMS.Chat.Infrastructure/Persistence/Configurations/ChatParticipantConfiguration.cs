using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Chat.Domain.Entities;

namespace NGO.PMS.Chat.Infrastructure.Persistence.Configurations;

public class ChatParticipantConfiguration : IEntityTypeConfiguration<ChatParticipant>
{
    public void Configure(EntityTypeBuilder<ChatParticipant> builder)
    {
        builder.ToTable("chat_participants");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Presence).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.TenantId).IsRequired().HasMaxLength(64);

        builder.HasIndex(e => new { e.ChatRoomId, e.UserId })
            .IsUnique()
            .HasDatabaseName("ix_chat_participants_room_user");

        builder.HasIndex(e => e.UserId).HasDatabaseName("ix_chat_participants_user");
    }
}
