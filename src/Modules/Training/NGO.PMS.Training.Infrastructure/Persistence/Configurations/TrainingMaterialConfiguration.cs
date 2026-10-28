using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Training.Domain.Entities;

namespace NGO.PMS.Training.Infrastructure.Persistence.Configurations;

public class TrainingMaterialConfiguration : IEntityTypeConfiguration<TrainingMaterial>
{
    public void Configure(EntityTypeBuilder<TrainingMaterial> builder)
    {
        builder.ToTable("training_materials");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TrainingProgramId).IsRequired();
        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.FileUrl).HasMaxLength(1000);
        builder.Property(e => e.MaterialType).IsRequired().HasMaxLength(50);

        builder.HasIndex(e => e.TrainingProgramId);
    }
}
