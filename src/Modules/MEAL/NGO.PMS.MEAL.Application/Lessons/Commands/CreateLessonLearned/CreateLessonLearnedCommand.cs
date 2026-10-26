using MediatR;

namespace NGO.PMS.MEAL.Application.Lessons.Commands.CreateLessonLearned;

public sealed record CreateLessonLearnedCommand(
    Guid ProjectId,
    string Title,
    string Description,
    string? Category,
    Guid? EvaluationId) : IRequest<Guid>;
