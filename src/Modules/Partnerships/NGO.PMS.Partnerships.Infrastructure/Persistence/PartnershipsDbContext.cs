using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Partnerships.Infrastructure.Persistence;

public class PartnershipsDbContext : MultiTenantDbContext, IPartnershipsDbContext
{
    public DbSet<SubGrantee> SubGrantees => Set<SubGrantee>();
    public DbSet<Disbursement> Disbursements => Set<Disbursement>();
    public DbSet<PartnerReport> PartnerReports => Set<PartnerReport>();
    public DbSet<PartnerCompliance> PartnerCompliances => Set<PartnerCompliance>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public PartnershipsDbContext(DbContextOptions<PartnershipsDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("partnerships");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PartnershipsDbContext).Assembly);
    }
}
