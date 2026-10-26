using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.MEAL.Infrastructure.Persistence;

public class MealDbContext : MultiTenantDbContext, IMealDbContext
{
    public DbSet<MealPlan> MealPlans => Set<MealPlan>();
    public DbSet<MealIndicator> MealIndicators => Set<MealIndicator>();
    public DbSet<IndicatorMeasurement> IndicatorMeasurements => Set<IndicatorMeasurement>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<EvaluationFinding> EvaluationFindings => Set<EvaluationFinding>();
    public DbSet<GesiAssessment> GesiAssessments => Set<GesiAssessment>();
    public DbSet<LessonLearned> LessonsLearned => Set<LessonLearned>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public MealDbContext(
        DbContextOptions<MealDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("meal");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MealDbContext).Assembly);
    }
}
