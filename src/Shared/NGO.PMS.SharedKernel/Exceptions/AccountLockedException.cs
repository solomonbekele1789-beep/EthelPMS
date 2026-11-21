namespace NGO.PMS.SharedKernel.Exceptions;

/// <summary>
/// Thrown when a user account is temporarily locked due to repeated failed login attempts.
/// Maps to HTTP 423 Locked.
/// </summary>
public class AccountLockedException : Exception
{
    public DateTime? LockedUntil { get; }

    public AccountLockedException(string message, DateTime? lockedUntil = null)
        : base(message)
    {
        LockedUntil = lockedUntil;
    }
}
