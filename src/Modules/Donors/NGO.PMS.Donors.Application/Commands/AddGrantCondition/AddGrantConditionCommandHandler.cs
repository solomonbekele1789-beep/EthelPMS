using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.AddGrantCondition;

public sealed class AddGrantConditionCommandHandler : IRequestHandler<AddGrantConditionCommand, Guid>
{
    private readonly IDonorsDbContext _db;

    public AddGrantConditionCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(AddGrantConditionCommand request, CancellationToken ct)
    {
        var grantExists = await _db.Grants.AnyAsync(g => g.Id == request.GrantId, ct);
        if (!grantExists)
            throw new NotFoundException(nameof(Domain.Entities.Grant), request.GrantId);

        var condition = GrantCondition.Create(request.GrantId, request.Description, request.DueDate);

        _db.GrantConditions.Add(condition);
        await _db.SaveChangesAsync(ct);
        return condition.Id;
    }
}
