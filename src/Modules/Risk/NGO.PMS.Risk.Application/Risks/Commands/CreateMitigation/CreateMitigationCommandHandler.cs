using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.Risk.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Risk.Application.Risks.Commands.CreateMitigation;

public class CreateMitigationCommandHandler : IRequestHandler<CreateMitigationCommand, Guid>
{
    private readonly IRiskDbContext _db;

    public CreateMitigationCommandHandler(IRiskDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(CreateMitigationCommand request, CancellationToken cancellationToken)
    {
        var riskExists = await _db.Risks
            .AnyAsync(r => r.Id == request.RiskId, cancellationToken);

        if (!riskExists)
            throw new NotFoundException("Risk", request.RiskId);

        var mitigation = RiskMitigation.Create(
            request.RiskId,
            request.Action,
            request.PlannedDate,
            request.ResponsiblePerson,
            request.ResponsibleUserId,
            request.EstimatedCost,
            request.Notes);

        _db.RiskMitigations.Add(mitigation);
        await _db.SaveChangesAsync(cancellationToken);

        return mitigation.Id;
    }
}
