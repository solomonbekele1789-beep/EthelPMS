using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Risk.Application.Risks.Commands.ResolveRisk;

public class ResolveRiskCommandHandler : IRequestHandler<ResolveRiskCommand, Guid>
{
    private readonly IRiskDbContext _db;

    public ResolveRiskCommandHandler(IRiskDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(ResolveRiskCommand request, CancellationToken cancellationToken)
    {
        var risk = await _db.Risks
            .FirstOrDefaultAsync(r => r.Id == request.RiskId, cancellationToken)
            ?? throw new NotFoundException("Risk", request.RiskId);

        risk.Resolve();
        await _db.SaveChangesAsync(cancellationToken);

        return risk.Id;
    }
}
