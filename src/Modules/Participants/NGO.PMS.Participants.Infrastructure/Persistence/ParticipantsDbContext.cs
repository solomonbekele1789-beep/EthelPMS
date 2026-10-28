using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Participants.Infrastructure.Persistence;

public class ParticipantsDbContext : MultiTenantDbContext, IParticipantsDbContext
{
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<HouseholdMember> HouseholdMembers => Set<HouseholdMember>();
    public DbSet<ParticipantEnrollment> ParticipantEnrollments => Set<ParticipantEnrollment>();
    public DbSet<ParticipantService> ParticipantServices => Set<ParticipantService>();
    public DbSet<GraduationBenchmark> GraduationBenchmarks => Set<GraduationBenchmark>();
    public DbSet<GraduationAssessment> GraduationAssessments => Set<GraduationAssessment>();
    public DbSet<GraduationDecision> GraduationDecisions => Set<GraduationDecision>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public ParticipantsDbContext(
        DbContextOptions<ParticipantsDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("participants");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ParticipantsDbContext).Assembly);
    }
}
