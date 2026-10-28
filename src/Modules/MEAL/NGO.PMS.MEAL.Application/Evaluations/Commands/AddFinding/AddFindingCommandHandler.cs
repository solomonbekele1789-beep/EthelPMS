using MediatR;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.AddFinding;

public class AddFindingCommandHandler : IRequestHandler<AddFindingCommand, Guid>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddFindingCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddFindingCommand request, CancellationToken ct)
    {
        var finding = EvaluationFinding.Create(
            request.EvaluationId, request.Finding,
            _currentUser.OrganizationId, request.DacCriteria,
            request.Recommendation, request.SortOrder);

        _db.EvaluationFindings.Add(finding);
        await _db.SaveChangesAsync(ct);
        return finding.Id;
    }
}
