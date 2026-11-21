namespace NGO.PMS.SharedKernel.Exceptions;

/// <summary>
/// Thrown when an operation conflicts with existing state (e.g. duplicate email, slug, or concurrency conflict).
/// Maps to HTTP 409 Conflict.
/// </summary>
public class ConflictException : Exception
{
    public string Code { get; }

    public ConflictException(string message, string code = "CONFLICT")
        : base(message)
    {
        Code = code;
    }
}
