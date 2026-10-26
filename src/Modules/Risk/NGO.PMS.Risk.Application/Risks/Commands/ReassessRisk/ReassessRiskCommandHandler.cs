using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Risk.Application.Risks.Commands.ReassessRisk;

public class ReassessRiskCommandHandler : IRequestHandler<ReassessRiskCommand, Guid>
{
    private readonly IRiskDbContext _db;

    public ReassessRiskCommandHandler(IRiskDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(ReassessRiskCommand request, CancellationToken cancellationToken)
    {
        var risk = await _db.Risks
            .FirstOrDefaultAsync(r => r.Id == request.RiskId, cancellationToken)
            ?? throw new NotFoundException("Risk", request.RiskId);

        risk.Reassess(request.Likelihood, request.Impact);
        await _db.SaveChangesAsync(cancellationToken);

        return risk.Id;
    }
}
