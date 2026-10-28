using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Graduation.Commands.RejectGraduation;

public class RejectGraduationCommandHandler : IRequestHandler<RejectGraduationCommand>
{
    private readonly IParticipantsDbContext _db;

    public RejectGraduationCommandHandler(IParticipantsDbContext db) => _db = db;

    public async Task Handle(RejectGraduationCommand request, CancellationToken ct)
    {
        var decision = await _db.GraduationDecisions
            .FirstOrDefaultAsync(d => d.Id == request.DecisionId, ct)
            ?? throw new NotFoundException("GraduationDecision", request.DecisionId);

        decision.Reject(request.Reason);
        await _db.SaveChangesAsync(ct);
    }
}
