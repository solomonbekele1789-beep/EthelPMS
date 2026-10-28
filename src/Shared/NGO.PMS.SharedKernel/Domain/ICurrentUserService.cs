namespace NGO.PMS.SharedKernel.Domain;

/// <summary>
/// Provides the authenticated user's identity and permissions.
/// Implemented in Identity.Infrastructure, consumed by all modules.
/// </summary>
public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid OrganizationId { get; }
    string Email { get; }
    string FullName { get; }
    IReadOnlyList<string> Permissions { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsAuthenticated { get; }
}
