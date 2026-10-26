using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Infrastructure.Persistence.Configurations;

public class GrantConditionConfiguration : IEntityTypeConfiguration<GrantCondition>
{
    public void Configure(EntityTypeBuilder<GrantCondition> builder)
    {
        builder.ToTable("grant_conditions");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.CompletionNotes).HasMaxLength(1000);

        builder.HasIndex(e => new { e.GrantId, e.DueDate })
            .HasDatabaseName("ix_grant_conditions_grant_id_due_date");
    }
}
