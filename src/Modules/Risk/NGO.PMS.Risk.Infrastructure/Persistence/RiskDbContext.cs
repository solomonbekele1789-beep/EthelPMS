using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.Risk.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Risk.Infrastructure.Persistence;

public class RiskDbContext : MultiTenantDbContext, IRiskDbContext
{
    public DbSet<RiskCategory> RiskCategories => Set<RiskCategory>();
    public DbSet<Domain.Entities.Risk> Risks => Set<Domain.Entities.Risk>();
    public DbSet<RiskMitigation> RiskMitigations => Set<RiskMitigation>();
    public DbSet<RiskAssessment> RiskAssessments => Set<RiskAssessment>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public RiskDbContext(
        DbContextOptions<RiskDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("risk");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RiskDbContext).Assembly);
    }
}
