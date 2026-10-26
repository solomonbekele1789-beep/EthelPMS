using Microsoft.EntityFrameworkCore;
using Moq;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Training.Tests.Helpers;

/// <summary>
/// Lightweight in-memory DbContext for Training unit tests.
/// Extends DbContext directly (not MultiTenantDbContext) so no tenant wiring is needed.
/// </summary>
public class TestTrainingDbContext : DbContext, ITrainingDbContext
{
    public TestTrainingDbContext(DbContextOptions<TestTrainingDbContext> options)
        : base(options) { }

    public DbSet<TrainingProgram> TrainingPrograms => Set<TrainingProgram>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();
    public DbSet<TrainingParticipant> TrainingParticipants => Set<TrainingParticipant>();
    public DbSet<Trainer> Trainers => Set<Trainer>();
    public DbSet<TrainingMaterial> TrainingMaterials => Set<TrainingMaterial>();
    public DbSet<TrainingEvaluation> TrainingEvaluations => Set<TrainingEvaluation>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TrainingProgram>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<TrainingSession>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<TrainingParticipant>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<Trainer>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<TrainingMaterial>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<TrainingEvaluation>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<OutboxMessage>(e => e.HasKey(x => x.Id));
    }
}

public static class TrainingTestFixture
{
    public static TestTrainingDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<TestTrainingDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new TestTrainingDbContext(options);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null, Guid? orgId = null, string? email = null)
    {
        var mock = new Mock<ICurrentUserService>();
        mock.Setup(x => x.UserId).Returns(userId ?? Guid.NewGuid());
        mock.Setup(x => x.OrganizationId).Returns(orgId ?? Guid.NewGuid());
        mock.Setup(x => x.Email).Returns(email ?? "test@example.com");
        mock.Setup(x => x.FullName).Returns("Test User");
        mock.Setup(x => x.IsAuthenticated).Returns(true);
        mock.Setup(x => x.Permissions).Returns(new List<string>());
        mock.Setup(x => x.Roles).Returns(new List<string>());
        return mock.Object;
    }
}
