using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Events;

/// <summary>
/// Raised when a role is assigned to a user.
/// </summary>
public sealed record RoleAssignedEvent(Guid UserId, Guid RoleId) : IDomainEvent;
