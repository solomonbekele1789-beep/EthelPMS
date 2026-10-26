using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Domain.Entities;

/// <summary>
/// Trainer profile — internal staff or external facilitator.
/// </summary>
public class Trainer : AuditableEntity
{
    public string FullName { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Specialization { get; private set; }
    public string? Organization { get; private set; }
    public bool IsInternal { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static Trainer Create(
        string fullName, bool isInternal,
        string? email = null, string? phone = null,
        string? specialization = null, string? organization = null)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("Full name is required.", nameof(fullName));

        return new Trainer
        {
            FullName = fullName.Trim(),
            IsInternal = isInternal,
            Email = email?.Trim(),
            Phone = phone?.Trim(),
            Specialization = specialization?.Trim(),
            Organization = organization?.Trim()
        };
    }

    public void Update(string fullName, string? email, string? phone,
        string? specialization, string? organization, bool isInternal)
    {
        FullName = fullName.Trim();
        Email = email?.Trim();
        Phone = phone?.Trim();
        Specialization = specialization?.Trim();
        Organization = organization?.Trim();
        IsInternal = isInternal;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
