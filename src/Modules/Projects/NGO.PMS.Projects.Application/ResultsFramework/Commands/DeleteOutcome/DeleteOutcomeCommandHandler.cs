using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteOutcome;

public class DeleteOutcomeCommandHandler : IRequestHandler<DeleteOutcomeCommand>
{
    private readonly IProjectsDbContext _db;

    public DeleteOutcomeCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(DeleteOutcomeCommand request, CancellationToken ct)
    {
        var outcome = await _db.Outcomes
            .FirstOrDefaultAsync(o => o.Id == request.OutcomeId, ct)
            ?? throw new NotFoundException("Outcome", request.OutcomeId);

        var hasOutputs = await _db.Outputs.AnyAsync(o => o.OutcomeId == request.OutcomeId, ct);
        if (hasOutputs)
            throw new BusinessRuleException("Cannot delete an outcome that contains outputs. Please remove its outputs first.");

        _db.Outcomes.Remove(outcome);
        await _db.SaveChangesAsync(ct);
    }
}
