using MediatR;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingEvaluation;

public class CreateTrainingEvaluationCommandHandler : IRequestHandler<CreateTrainingEvaluationCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTrainingEvaluationCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateTrainingEvaluationCommand request, CancellationToken ct)
    {
        var evaluation = TrainingEvaluation.Create(
            request.TrainingSessionId, request.OverallRating, request.EvaluationDate,
            request.EvaluatedBy, request.Feedback, request.Recommendations);

        _db.TrainingEvaluations.Add(evaluation);
        await _db.SaveChangesAsync(ct);
        return evaluation.Id;
    }
}
