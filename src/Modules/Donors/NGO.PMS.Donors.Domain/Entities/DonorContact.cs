using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Entities;

public class DonorContact : AuditableEntity, IMultiTenant
{
    public Guid DonorId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string? Title { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public bool IsPrimary { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private DonorContact() { }

    public static DonorContact Create(Guid donorId, string fullName, string email, string? title, string? phone, bool isPrimary)
    {
        if (donorId == Guid.Empty)
            throw new ArgumentException("Donor ID is required.", nameof(donorId));
        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("Contact full name is required.", nameof(fullName));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Contact email is required.", nameof(email));

        return new DonorContact
        {
            DonorId = donorId,
            FullName = fullName,
            Email = email,
            Title = title,
            Phone = phone,
            IsPrimary = isPrimary
        };
    }

    public void Update(string fullName, string email, string? title, string? phone)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("Contact full name is required.", nameof(fullName));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Contact email is required.", nameof(email));

        FullName = fullName;
        Email = email;
        Title = title;
        Phone = phone;
    }

    public void SetAsPrimary()
    {
        IsPrimary = true;
    }
}
