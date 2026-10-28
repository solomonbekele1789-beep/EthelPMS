using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutcome;

public class UpdateOutcomeCommandHandler : IRequestHandler<UpdateOutcomeCommand>
{
    private readonly IProjectsDbContext _db;

    public UpdateOutcomeCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(UpdateOutcomeCommand request, CancellationToken ct)
    {
        var outcome = await _db.Outcomes
            .FirstOrDefaultAsync(o => o.Id == request.OutcomeId, ct)
            ?? throw new NotFoundException("Outcome", request.OutcomeId);

        outcome.Update(request.Description, request.BaselineValue, request.TargetValue, request.Assumptions);

        await _db.SaveChangesAsync(ct);
    }
}
