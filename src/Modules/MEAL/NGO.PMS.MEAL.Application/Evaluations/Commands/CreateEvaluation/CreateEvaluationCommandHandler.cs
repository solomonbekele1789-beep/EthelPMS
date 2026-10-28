using MediatR;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.CreateEvaluation;

public class CreateEvaluationCommandHandler : IRequestHandler<CreateEvaluationCommand, Guid>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateEvaluationCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateEvaluationCommand request, CancellationToken ct)
    {
        var evaluation = Evaluation.Create(
            request.Title, request.ProjectId, request.EvaluationType,
            request.PlannedStartDate, request.PlannedEndDate,
            _currentUser.OrganizationId, request.PrimaryDacCriteria,
            request.Budget, request.Description);

        _db.Evaluations.Add(evaluation);
        await _db.SaveChangesAsync(ct);
        return evaluation.Id;
    }
}
