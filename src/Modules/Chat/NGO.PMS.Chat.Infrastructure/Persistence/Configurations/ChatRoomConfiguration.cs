using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Chat.Domain.Entities;

namespace NGO.PMS.Chat.Infrastructure.Persistence.Configurations;

public class ChatRoomConfiguration : IEntityTypeConfiguration<ChatRoom>
{
    public void Configure(EntityTypeBuilder<ChatRoom> builder)
    {
        builder.ToTable("chat_rooms");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(1000);
        builder.Property(e => e.AvatarUrl).HasMaxLength(500);
        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.TenantId).IsRequired().HasMaxLength(64);

        builder.HasMany(e => e.Participants)
            .WithOne()
            .HasForeignKey(e => e.ChatRoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Messages)
            .WithOne()
            .HasForeignKey(e => e.ChatRoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.Type).HasDatabaseName("ix_chat_rooms_type");
        builder.HasIndex(e => e.TenantId).HasDatabaseName("ix_chat_rooms_tenant");
    }
}
