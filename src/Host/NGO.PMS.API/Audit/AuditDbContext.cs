using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Audit;

namespace NGO.PMS.API.Audit;

/// <summary>
/// Dedicated DbContext for the immutable audit trail.
/// Targets the 'audit' PostgreSQL schema.
/// Only INSERT operations are permitted at the database level.
/// </summary>
public sealed class AuditDbContext : DbContext
{
    public AuditDbContext(DbContextOptions<AuditDbContext> options)
        : base(options)
    {
    }

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("audit");

        modelBuilder.Entity<AuditLog>(builder =>
        {
            builder.ToTable("audit_logs");

            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();

            builder.Property(a => a.TableName)
                .HasColumnName("table_name")
                .HasMaxLength(128)
                .IsRequired();

            builder.Property(a => a.SchemaName)
                .HasColumnName("schema_name")
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(a => a.EntityId)
                .HasColumnName("entity_id")
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(a => a.Operation)
                .HasColumnName("operation")
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(a => a.OldValues)
                .HasColumnName("old_values")
                .HasColumnType("jsonb");

            builder.Property(a => a.NewValues)
                .HasColumnName("new_values")
                .HasColumnType("jsonb");

            builder.Property(a => a.ChangedColumns)
                .HasColumnName("changed_columns")
                .HasColumnType("text[]");

            builder.Property(a => a.UserId)
                .HasColumnName("user_id");

            builder.Property(a => a.UserEmail)
                .HasColumnName("user_email")
                .HasMaxLength(256);

            builder.Property(a => a.OrganizationId)
                .HasColumnName("organization_id");

            builder.Property(a => a.CorrelationId)
                .HasColumnName("correlation_id")
                .HasMaxLength(64);

            builder.Property(a => a.IpAddress)
                .HasColumnName("ip_address")
                .HasMaxLength(45);

            builder.Property(a => a.UserAgent)
                .HasColumnName("user_agent")
                .HasMaxLength(512);

            builder.Property(a => a.Timestamp)
                .HasColumnName("timestamp")
                .HasDefaultValueSql("now()")
                .IsRequired();
        });
    }
}
