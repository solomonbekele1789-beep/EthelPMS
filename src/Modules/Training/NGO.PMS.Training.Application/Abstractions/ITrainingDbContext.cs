using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Training.Application.Abstractions;

public interface ITrainingDbContext
{
    DbSet<TrainingProgram> TrainingPrograms { get; }
    DbSet<TrainingSession> TrainingSessions { get; }
    DbSet<TrainingParticipant> TrainingParticipants { get; }
    DbSet<Trainer> Trainers { get; }
    DbSet<TrainingMaterial> TrainingMaterials { get; }
    DbSet<TrainingEvaluation> TrainingEvaluations { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
