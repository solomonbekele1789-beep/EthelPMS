using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Projects.Application;

public interface IProjectsDbContext
{
    DbSet<Project> Projects { get; }
    DbSet<ProjectPhase> ProjectPhases { get; }
    DbSet<ProjectRevision> ProjectRevisions { get; }
    DbSet<ProjectTeamMember> ProjectTeamMembers { get; }
    DbSet<ProjectUserView> ProjectUsers { get; }
    DbSet<Outcome> Outcomes { get; }
    DbSet<Output> Outputs { get; }
    DbSet<Activity> Activities { get; }
    DbSet<Indicator> Indicators { get; }
    DbSet<IndicatorTarget> IndicatorTargets { get; }
    DbSet<UnitOfMeasurement> UnitsOfMeasurement { get; }
    DbSet<InterventionArea> InterventionAreas { get; }
    DbSet<ProjectInterventionArea> ProjectInterventionAreas { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
