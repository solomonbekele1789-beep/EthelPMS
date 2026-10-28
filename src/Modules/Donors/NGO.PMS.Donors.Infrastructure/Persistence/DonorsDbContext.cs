using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Donors.Infrastructure.Persistence;

public class DonorsDbContext : MultiTenantDbContext, IDonorsDbContext
{
    public DbSet<Donor> Donors => Set<Donor>();
    public DbSet<DonorContact> DonorContacts => Set<DonorContact>();
    public DbSet<Grant> Grants => Set<Grant>();
    public DbSet<GrantCondition> GrantConditions => Set<GrantCondition>();
    public DbSet<GrantReport> GrantReports => Set<GrantReport>();
    public DbSet<DonorCommunication> DonorCommunications => Set<DonorCommunication>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public DonorsDbContext(DbContextOptions<DonorsDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("donors");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DonorsDbContext).Assembly);
    }
}
