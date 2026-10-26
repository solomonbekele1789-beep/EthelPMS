using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Assets.AssignAsset;

public sealed class AssignAssetCommandHandler : IRequestHandler<AssignAssetCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AssignAssetCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AssignAssetCommand request, CancellationToken ct)
    {
        var asset = await _db.Assets
            .FirstOrDefaultAsync(a => a.Id == request.AssetId, ct);

        if (asset is null)
            throw new NotFoundException(nameof(Domain.Entities.Asset), request.AssetId);

        asset.AssignTo(request.AssignedToUserId, request.AssignedToName);

        var assignment = AssetAssignment.Create(
            request.AssetId,
            request.AssignedToUserId,
            request.AssignedToName,
            request.AssignmentDate,
            _currentUser.OrganizationId);

        _db.AssetAssignments.Add(assignment);
        await _db.SaveChangesAsync(ct);
        return assignment.Id;
    }
}
