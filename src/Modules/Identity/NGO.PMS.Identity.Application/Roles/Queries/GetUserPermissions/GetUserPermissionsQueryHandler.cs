using MediatR;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Identity.Application.Roles.Queries.GetUserPermissions;

/// <summary>
/// Delegates to IPermissionService (Dapper) for fast permission reads.
/// </summary>
public sealed class GetUserPermissionsQueryHandler
    : IRequestHandler<GetUserPermissionsQuery, List<string>>
{
    private readonly IPermissionService _permissionService;

    public GetUserPermissionsQueryHandler(IPermissionService permissionService)
        => _permissionService = permissionService;

    public async Task<List<string>> Handle(
        GetUserPermissionsQuery request, CancellationToken ct)
    {
        var permissions = await _permissionService
            .GetUserPermissionsAsync(request.UserId, ct);
        return permissions.ToList();
    }
}
