using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace NGO.PMS.Risk.Infrastructure.Persistence.Configurations;

public class RiskConfiguration : IEntityTypeConfiguration<Domain.Entities.Risk>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Risk> builder)
    {
        builder.ToTable("risks");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(e => e.Likelihood)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Impact)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Owner)
            .HasMaxLength(200);

        builder.Property(e => e.Location)
            .HasMaxLength(300);

        builder.Property(e => e.ResidualRiskNotes)
            .HasMaxLength(2000);

        builder.Property(e => e.OrganizationId)
            .IsRequired();

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany(e => e.Mitigations)
            .WithOne(m => m.Risk!)
            .HasForeignKey(m => m.RiskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Assessments)
            .WithOne(a => a.Risk!)
            .HasForeignKey(a => a.RiskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.ProjectId, e.Status });
        builder.HasIndex(e => e.OrganizationId);
    }
}
