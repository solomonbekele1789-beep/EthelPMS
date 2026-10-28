using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.MarkConditionMet;

public sealed class MarkConditionMetCommandHandler : IRequestHandler<MarkConditionMetCommand, Unit>
{
    private readonly IDonorsDbContext _db;

    public MarkConditionMetCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(MarkConditionMetCommand request, CancellationToken ct)
    {
        var condition = await _db.GrantConditions.FirstOrDefaultAsync(c => c.Id == request.ConditionId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.GrantCondition), request.ConditionId);

        condition.MarkMet(request.Notes);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
