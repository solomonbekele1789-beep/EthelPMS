using MediatR;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.Lessons.Queries.ListLessonsLearned;

public sealed record ListLessonsLearnedQuery(
    Guid? ProjectId,
    string? Category) : IRequest<List<LessonLearnedDto>>;
