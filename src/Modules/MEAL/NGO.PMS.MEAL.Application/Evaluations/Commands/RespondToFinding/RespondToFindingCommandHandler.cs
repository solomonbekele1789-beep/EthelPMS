using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.RespondToFinding;

public class RespondToFindingCommandHandler : IRequestHandler<RespondToFindingCommand>
{
    private readonly IMealDbContext _db;

    public RespondToFindingCommandHandler(IMealDbContext db) => _db = db;

    public async Task Handle(RespondToFindingCommand request, CancellationToken ct)
    {
        var finding = await _db.EvaluationFindings
            .FirstOrDefaultAsync(f => f.Id == request.FindingId, ct)
            ?? throw new NotFoundException("EvaluationFinding", request.FindingId);

        finding.ProvideManagementResponse(request.Response, request.ResponsibleUserId, request.DueDate);
        await _db.SaveChangesAsync(ct);
    }
}
