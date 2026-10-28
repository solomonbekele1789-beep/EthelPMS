using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Entities;

/// <summary>
/// Household membership tracking per REQ-PART-004.
/// Links participants into households with relationship metadata.
/// </summary>
public class HouseholdMember : AuditableEntity
{
    public string HouseholdCode { get; private set; } = string.Empty;
    public Guid ParticipantId { get; private set; }
    public bool IsHeadOfHousehold { get; private set; }
    public string? RelationshipToHead { get; private set; }
    public string? Address { get; private set; }
    public string? Woreda { get; private set; }
    public string? Kebele { get; private set; }
    public int? HouseholdSize { get; private set; }
    public string? Notes { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Participant? Participant { get; private set; }

    public static HouseholdMember Create(
        string householdCode, Guid participantId, Guid orgId,
        bool isHead = false, string? relationshipToHead = null,
        int? householdSize = null)
    {
        if (string.IsNullOrWhiteSpace(householdCode))
            throw new ArgumentException("Household code is required.", nameof(householdCode));

        return new HouseholdMember
        {
            HouseholdCode = householdCode.Trim(),
            ParticipantId = participantId,
            IsHeadOfHousehold = isHead,
            RelationshipToHead = relationshipToHead,
            HouseholdSize = householdSize,
            OrganizationId = orgId
        };
    }

    public void Update(bool isHead, string? relationship, int? householdSize,
        string? address, string? woreda, string? kebele, string? notes)
    {
        IsHeadOfHousehold = isHead;
        RelationshipToHead = relationship;
        HouseholdSize = householdSize;
        Address = address;
        Woreda = woreda;
        Kebele = kebele;
        Notes = notes;
    }
}
