using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.Partnerships.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Domain.Entities;

public class SubGrantee : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? RegistrationNumber { get; private set; }
    public string ContactPerson { get; private set; } = string.Empty;
    public string ContactEmail { get; private set; } = string.Empty;
    public string? ContactPhone { get; private set; }
    public string? Address { get; private set; }
    public string Country { get; private set; } = string.Empty;
    public PartnerType PartnerType { get; private set; }
    public PartnerStatus Status { get; private set; }
    public PartnerRiskRating RiskRating { get; private set; }
    public int? CapacityScore { get; private set; }
    public DateTime? OnboardingDate { get; private set; }
    public string? Notes { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private SubGrantee() { }

    public static SubGrantee Create(
        Guid organizationId,
        string name,
        string contactPerson,
        string contactEmail,
        string? contactPhone,
        string country,
        PartnerType partnerType,
        string? registrationNumber,
        string? address)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Sub-grantee name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(contactPerson))
            throw new ArgumentException("Contact person is required.", nameof(contactPerson));
        if (string.IsNullOrWhiteSpace(contactEmail))
            throw new ArgumentException("Contact email is required.", nameof(contactEmail));
        if (string.IsNullOrWhiteSpace(country))
            throw new ArgumentException("Country is required.", nameof(country));

        var subGrantee = new SubGrantee
        {
            OrganizationId = organizationId,
            Name = name,
            ContactPerson = contactPerson,
            ContactEmail = contactEmail,
            ContactPhone = contactPhone,
            Country = country,
            PartnerType = partnerType,
            RegistrationNumber = registrationNumber,
            Address = address,
            Status = PartnerStatus.Prospect,
            RiskRating = PartnerRiskRating.Medium
        };

        subGrantee.AddDomainEvent(new SubGranteeRegisteredEvent(subGrantee.Id, organizationId, name));

        return subGrantee;
    }

    public void Update(
        string name,
        string contactPerson,
        string contactEmail,
        string? contactPhone,
        string? address,
        string? notes)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Sub-grantee name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(contactPerson))
            throw new ArgumentException("Contact person is required.", nameof(contactPerson));
        if (string.IsNullOrWhiteSpace(contactEmail))
            throw new ArgumentException("Contact email is required.", nameof(contactEmail));

        Name = name;
        ContactPerson = contactPerson;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        Address = address;
        Notes = notes;
    }

    public void Activate()
    {
        if (string.IsNullOrWhiteSpace(ContactPerson))
            throw new InvalidOperationException("Contact person is required to activate a partner.");
        if (string.IsNullOrWhiteSpace(ContactEmail))
            throw new InvalidOperationException("Contact email is required to activate a partner.");

        Status = PartnerStatus.Active;
        OnboardingDate ??= DateTime.UtcNow;
    }

    public void Suspend(string reason)
    {
        if (Status != PartnerStatus.Active)
            throw new InvalidOperationException("Only active partners can be suspended.");

        Status = PartnerStatus.Suspended;
        Notes = reason;
    }

    public void AssessRisk(PartnerRiskRating rating, int? capacityScore)
    {
        if (capacityScore.HasValue && (capacityScore.Value < 0 || capacityScore.Value > 100))
            throw new ArgumentException("Capacity score must be between 0 and 100.", nameof(capacityScore));

        RiskRating = rating;
        CapacityScore = capacityScore;
    }
}
