using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Graduation.Commands.ApproveGraduation;

public class ApproveGraduationCommandHandler : IRequestHandler<ApproveGraduationCommand>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApproveGraduationCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(ApproveGraduationCommand request, CancellationToken ct)
    {
        var decision = await _db.GraduationDecisions
            .FirstOrDefaultAsync(d => d.Id == request.DecisionId, ct)
            ?? throw new NotFoundException("GraduationDecision", request.DecisionId);

        decision.Approve(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);
    }
}
