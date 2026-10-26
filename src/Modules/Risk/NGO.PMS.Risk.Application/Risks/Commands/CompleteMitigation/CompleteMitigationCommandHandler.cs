using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Risk.Application.Risks.Commands.CompleteMitigation;

public class CompleteMitigationCommandHandler : IRequestHandler<CompleteMitigationCommand, Guid>
{
    private readonly IRiskDbContext _db;

    public CompleteMitigationCommandHandler(IRiskDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(CompleteMitigationCommand request, CancellationToken cancellationToken)
    {
        var mitigation = await _db.RiskMitigations
            .FirstOrDefaultAsync(m => m.Id == request.MitigationId, cancellationToken)
            ?? throw new NotFoundException("RiskMitigation", request.MitigationId);

        mitigation.Complete();
        await _db.SaveChangesAsync(cancellationToken);

        return mitigation.Id;
    }
}
