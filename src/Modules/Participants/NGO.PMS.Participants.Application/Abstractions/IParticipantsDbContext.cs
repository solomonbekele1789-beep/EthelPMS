using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Participants.Application.Abstractions;

public interface IParticipantsDbContext
{
    DbSet<Participant> Participants { get; }
    DbSet<HouseholdMember> HouseholdMembers { get; }
    DbSet<ParticipantEnrollment> ParticipantEnrollments { get; }
    DbSet<ParticipantService> ParticipantServices { get; }
    DbSet<GraduationBenchmark> GraduationBenchmarks { get; }
    DbSet<GraduationAssessment> GraduationAssessments { get; }
    DbSet<GraduationDecision> GraduationDecisions { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
