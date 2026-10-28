using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Projects.Infrastructure.Persistence;

public class ProjectsDbContext : MultiTenantDbContext, IProjectsDbContext
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectPhase> ProjectPhases => Set<ProjectPhase>();
    public DbSet<ProjectRevision> ProjectRevisions => Set<ProjectRevision>();
    public DbSet<ProjectTeamMember> ProjectTeamMembers => Set<ProjectTeamMember>();
    public DbSet<Outcome> Outcomes => Set<Outcome>();
    public DbSet<Output> Outputs => Set<Output>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Indicator> Indicators => Set<Indicator>();
    public DbSet<IndicatorTarget> IndicatorTargets => Set<IndicatorTarget>();
    public DbSet<UnitOfMeasurement> UnitsOfMeasurement => Set<UnitOfMeasurement>();
    public DbSet<InterventionArea> InterventionAreas => Set<InterventionArea>();
    public DbSet<ProjectInterventionArea> ProjectInterventionAreas => Set<ProjectInterventionArea>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public ProjectsDbContext(
        DbContextOptions<ProjectsDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("projects");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProjectsDbContext).Assembly);
    }
}
