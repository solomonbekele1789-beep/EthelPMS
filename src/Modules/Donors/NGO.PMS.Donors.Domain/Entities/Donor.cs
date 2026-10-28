using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Entities;

public class Donor : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public string Name { get; private set; } = string.Empty;
    public string? Acronym { get; private set; }
    public string? Country { get; private set; }
    public string? Website { get; private set; }
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Address { get; private set; }
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; } = true;
    public decimal? DefaultProcurementThreshold { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    // Navigation
    private readonly List<DonorContact> _contacts = [];
    public IReadOnlyList<DonorContact> Contacts => _contacts.AsReadOnly();

    private readonly List<Grant> _grants = [];
    public IReadOnlyList<Grant> Grants => _grants.AsReadOnly();

    private readonly List<DonorCommunication> _communications = [];
    public IReadOnlyList<DonorCommunication> Communications => _communications.AsReadOnly();

    private Donor() { }

    public static Donor Create(string name, string? acronym, string? country, string? website,
        string? email, string? phone, string? address, string? notes)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Donor name is required.", nameof(name));

        return new Donor
        {
            Name = name,
            Acronym = acronym,
            Country = country,
            Website = website,
            Email = email,
            Phone = phone,
            Address = address,
            Notes = notes,
            IsActive = true
        };
    }

    public void Update(string name, string? acronym, string? country, string? website,
        string? email, string? phone, string? address, string? notes)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Donor name is required.", nameof(name));

        Name = name;
        Acronym = acronym;
        Country = country;
        Website = website;
        Email = email;
        Phone = phone;
        Address = address;
        Notes = notes;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void SetProcurementThreshold(decimal amount)
    {
        if (amount < 0)
            throw new ArgumentException("Procurement threshold cannot be negative.", nameof(amount));

        DefaultProcurementThreshold = amount;
    }
}
