using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.CompleteEvaluation;

public class CompleteEvaluationCommandHandler : IRequestHandler<CompleteEvaluationCommand>
{
    private readonly IMealDbContext _db;

    public CompleteEvaluationCommandHandler(IMealDbContext db) => _db = db;

    public async Task Handle(CompleteEvaluationCommand request, CancellationToken ct)
    {
        var evaluation = await _db.Evaluations
            .FirstOrDefaultAsync(e => e.Id == request.EvaluationId, ct)
            ?? throw new NotFoundException("Evaluation", request.EvaluationId);

        evaluation.Complete(request.ActualEndDate);
        await _db.SaveChangesAsync(ct);
    }
}
