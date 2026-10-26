using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Infrastructure.Persistence.Configurations;

public class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.ToTable("locations");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Name).HasMaxLength(200).IsRequired();
        builder.Property(l => l.NameAm).HasMaxLength(200);
        builder.Property(l => l.Level).HasConversion<string>().HasMaxLength(20);
        builder.Property(l => l.Code).HasMaxLength(50);

        builder.HasIndex(l => l.Level);
        builder.HasIndex(l => l.ParentId);

        builder.HasOne(l => l.Parent)
            .WithMany(l => l.Children)
            .HasForeignKey(l => l.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Ignore(l => l.DomainEvents);
    }
}
