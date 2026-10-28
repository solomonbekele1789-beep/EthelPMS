namespace NGO.PMS.SharedKernel.Exceptions;

/// <summary>
/// Thrown when the user lacks permission for the requested action. Maps to HTTP 403.
/// </summary>
public class ForbiddenException : Exception
{
    public string? Permission { get; }

    public ForbiddenException(string? permission = null)
        : base(permission is not null
            ? $"You do not have the required permission: {permission}"
            : "You do not have permission to perform this action.")
    {
        Permission = permission;
    }
}
