using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class OutputConfiguration : IEntityTypeConfiguration<Output>
{
    public void Configure(EntityTypeBuilder<Output> builder)
    {
        builder.ToTable("outputs");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Description).IsRequired().HasMaxLength(2000);
        builder.Property(e => e.Assumptions).HasMaxLength(2000);
        builder.Property(e => e.BaselineValue).HasPrecision(18, 4);
        builder.Property(e => e.TargetValue).HasPrecision(18, 4);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.OutcomeId).HasDatabaseName("ix_outputs_outcome");

        builder.HasMany(e => e.Activities).WithOne(a => a.Output).HasForeignKey(a => a.OutputId);
        builder.HasMany(e => e.Indicators).WithOne(i => i.Output).HasForeignKey(i => i.OutputId);
    }
}
