using MediatR;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Application.Lessons.Commands.CreateLessonLearned;

public class CreateLessonLearnedCommandHandler : IRequestHandler<CreateLessonLearnedCommand, Guid>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateLessonLearnedCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateLessonLearnedCommand request, CancellationToken ct)
    {
        var lesson = LessonLearned.Create(
            request.ProjectId, request.Title, request.Description,
            _currentUser.OrganizationId, request.Category, request.EvaluationId);

        _db.LessonsLearned.Add(lesson);
        await _db.SaveChangesAsync(ct);
        return lesson.Id;
    }
}
