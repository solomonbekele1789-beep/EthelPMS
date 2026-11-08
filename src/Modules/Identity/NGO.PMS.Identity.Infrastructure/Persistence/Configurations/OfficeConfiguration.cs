using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Infrastructure.Persistence.Configurations;

public class OfficeConfiguration : IEntityTypeConfiguration<Office>
{
    public void Configure(EntityTypeBuilder<Office> builder)
    {
        builder.ToTable("offices");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Name).HasMaxLength(200).IsRequired();
        builder.Property(o => o.Code).HasMaxLength(50).IsRequired();
        builder.Property(o => o.OfficeType).HasMaxLength(50).IsRequired().HasDefaultValue("HeadOffice");
        builder.Property(o => o.Description).HasMaxLength(2000);
        builder.Property(o => o.LocationAddress).HasMaxLength(500);
        builder.Property(o => o.IsActive).HasDefaultValue(true);
        builder.Property(o => o.OrganizationId).IsRequired();

        builder.HasIndex(o => new { o.Code, o.OrganizationId }).IsUnique();

        builder.HasOne(o => o.ParentOffice)
            .WithMany(o => o.ChildOffices)
            .HasForeignKey(o => o.ParentOfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Location)
            .WithMany()
            .HasForeignKey(o => o.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Ignore(o => o.DomainEvents);
    }
}
