using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.VerifyFinding;

public class VerifyFindingCommandHandler : IRequestHandler<VerifyFindingCommand>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public VerifyFindingCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(VerifyFindingCommand request, CancellationToken ct)
    {
        var finding = await _db.EvaluationFindings
            .FirstOrDefaultAsync(f => f.Id == request.FindingId, ct)
            ?? throw new NotFoundException("EvaluationFinding", request.FindingId);

        finding.Verify(_currentUser.UserId, request.Notes);
        await _db.SaveChangesAsync(ct);
    }
}
