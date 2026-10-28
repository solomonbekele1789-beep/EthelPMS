using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Training.Infrastructure.Persistence;

public class TrainingDbContext : MultiTenantDbContext, ITrainingDbContext
{
    public DbSet<TrainingProgram> TrainingPrograms => Set<TrainingProgram>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();
    public DbSet<TrainingParticipant> TrainingParticipants => Set<TrainingParticipant>();
    public DbSet<Trainer> Trainers => Set<Trainer>();
    public DbSet<TrainingMaterial> TrainingMaterials => Set<TrainingMaterial>();
    public DbSet<TrainingEvaluation> TrainingEvaluations => Set<TrainingEvaluation>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public TrainingDbContext(
        DbContextOptions<TrainingDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("training");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TrainingDbContext).Assembly);
    }
}
