using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.MEAL.Application.Abstractions;

public interface IMealDbContext
{
    DbSet<MealPlan> MealPlans { get; }
    DbSet<MealIndicator> MealIndicators { get; }
    DbSet<IndicatorMeasurement> IndicatorMeasurements { get; }
    DbSet<Evaluation> Evaluations { get; }
    DbSet<EvaluationFinding> EvaluationFindings { get; }
    DbSet<GesiAssessment> GesiAssessments { get; }
    DbSet<LessonLearned> LessonsLearned { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
