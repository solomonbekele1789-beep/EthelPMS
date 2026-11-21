using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Infrastructure.Persistence.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("organizations");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Name).HasMaxLength(200).IsRequired();
        builder.Property(o => o.Slug).HasMaxLength(100).IsRequired();
        builder.Property(o => o.LogoUrl).HasMaxLength(500);
        builder.Property(o => o.Timezone).HasMaxLength(50).HasDefaultValue("Africa/Addis_Ababa");
        builder.Property(o => o.CalendarPreference).HasConversion<string>().HasMaxLength(20);

        builder.Property(o => o.Settings).HasColumnType("jsonb").HasDefaultValue("{}");
        builder.HasIndex(o => o.Slug).IsUnique();

        builder.Ignore(o => o.DomainEvents);
    }
}
