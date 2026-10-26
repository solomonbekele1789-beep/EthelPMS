using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Dip.Commands.CreateDipMilestone;

public class CreateDipMilestoneCommandHandler : IRequestHandler<CreateDipMilestoneCommand, Guid>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateDipMilestoneCommandHandler(IPlanningDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateDipMilestoneCommand request, CancellationToken ct)
    {
        var dipExists = await _db.DipItems.AnyAsync(d => d.Id == request.DipItemId, ct);
        if (!dipExists) throw new NotFoundException("DIP item", request.DipItemId);

        var milestone = DipMilestone.Create(request.DipItemId, request.Title, request.DueDate, _currentUser.OrganizationId);

        _db.DipMilestones.Add(milestone);
        await _db.SaveChangesAsync(ct);
        return milestone.Id;
    }
}
