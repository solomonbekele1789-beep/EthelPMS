using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class Supplier : AuditableEntity, IMultiTenant, ISoftDeletable
{
    private Supplier() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string Name { get; private set; } = null!;
    public string ContactPerson { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string? Phone { get; private set; }
    public string? Address { get; private set; }
    public string? TaxIdNumber { get; private set; }
    public SupplierStatus Status { get; private set; }
    public decimal Rating { get; private set; }
    public string? BlacklistReason { get; private set; }
    public DateTime? BlacklistDate { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    public static Supplier Create(string name, string contactPerson, string email, Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(contactPerson);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        return new Supplier
        {
            Name = name,
            ContactPerson = contactPerson,
            Email = email,
            Status = SupplierStatus.Active,
            Rating = 0,
            OrganizationId = orgId
        };
    }

    public void UpdateDetails(string name, string contactPerson, string email, string? phone, string? address, string? taxIdNumber)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(contactPerson);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        Name = name;
        ContactPerson = contactPerson;
        Email = email;
        Phone = phone;
        Address = address;
        TaxIdNumber = taxIdNumber;
    }

    public void Rate(decimal score)
    {
        if (score < 0 || score > 5)
            throw new ArgumentOutOfRangeException(nameof(score), "Rating must be between 0 and 5.");

        Rating = score;
    }

    public void Blacklist(string reason)
    {
        if (Status == SupplierStatus.Blacklisted)
            throw new InvalidOperationException("Supplier is already blacklisted.");

        ArgumentException.ThrowIfNullOrWhiteSpace(reason);

        Status = SupplierStatus.Blacklisted;
        BlacklistReason = reason;
        BlacklistDate = DateTime.UtcNow;
    }

    public void Reactivate()
    {
        if (Status == SupplierStatus.Blacklisted && !string.IsNullOrWhiteSpace(BlacklistReason))
            throw new InvalidOperationException(
                "Cannot reactivate a blacklisted supplier without clearing the blacklist reason first.");

        Status = SupplierStatus.Active;
        BlacklistReason = null;
        BlacklistDate = null;
    }
}
