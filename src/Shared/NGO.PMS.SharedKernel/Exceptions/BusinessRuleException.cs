namespace NGO.PMS.SharedKernel.Exceptions;

/// <summary>
/// Thrown when a domain business rule is violated. Maps to HTTP 422.
/// </summary>
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}
