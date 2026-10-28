using MediatR;

namespace NGO.PMS.Identity.Application.Roles.Queries.GetUserPermissions;

/// <summary>
/// Returns the flat list of permission codes for a given user.
/// </summary>
public sealed record GetUserPermissionsQuery(Guid UserId) : IRequest<List<string>>;
