using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(512);
        builder.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.MiddleName).HasMaxLength(100);
        builder.Property(u => u.LastName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.Phone).HasMaxLength(20);
        builder.Property(u => u.DateOfBirth).HasColumnType("date");
        builder.Property(u => u.Gender).HasMaxLength(20);
        builder.Property(u => u.Address).HasMaxLength(500);
        builder.Property(u => u.EmployeeId).HasMaxLength(50);
        builder.Property(u => u.EmploymentDate).HasColumnType("date");
        builder.Property(u => u.LevelOfEducation).HasMaxLength(100);
        builder.Property(u => u.Qualification).HasMaxLength(200);
        builder.Property(u => u.BasicSalary).HasPrecision(18, 2);
        builder.Property(u => u.ProfilePhotoUrl).HasColumnType("text");
        builder.Property(u => u.Region).HasMaxLength(100);
        builder.Property(u => u.OfficeLevel).HasMaxLength(50);
        builder.Property(u => u.OrganizationId).IsRequired();

        builder.HasIndex(u => new { u.Email, u.OrganizationId }).IsUnique();
        builder.HasIndex(u => u.OrganizationId);

        builder.HasOne(u => u.Office)
            .WithMany()
            .HasForeignKey(u => u.OfficeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(u => u.Manager)
            .WithMany()
            .HasForeignKey(u => u.ManagerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(u => u.UserRoles)
            .WithOne(ur => ur.User)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(u => u.FullName);
        builder.Ignore(u => u.IsLockedOut);
        builder.Ignore(u => u.DomainEvents);
    }
}
