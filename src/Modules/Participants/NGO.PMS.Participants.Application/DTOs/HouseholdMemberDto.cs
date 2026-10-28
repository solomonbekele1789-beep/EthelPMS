namespace NGO.PMS.Participants.Application.DTOs;

public class HouseholdMemberDto
{
    public Guid Id { get; set; }
    public string HouseholdCode { get; set; } = string.Empty;
    public Guid ParticipantId { get; set; }
    public bool IsHeadOfHousehold { get; set; }
    public string? RelationshipToHead { get; set; }
    public string? Address { get; set; }
    public string? Woreda { get; set; }
    public string? Kebele { get; set; }
    public int? HouseholdSize { get; set; }
}
