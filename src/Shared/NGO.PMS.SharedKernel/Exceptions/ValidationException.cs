using FluentValidation.Results;

namespace NGO.PMS.SharedKernel.Exceptions;

/// <summary>
/// Thrown when FluentValidation detects invalid input. Maps to HTTP 400.
/// </summary>
public class ValidationException : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : base("One or more validation errors occurred.")
    {
        Errors = failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());
    }
}
