namespace NGO.PMS.Participants.Application.DTOs;

/// <summary>
/// Graduation pipeline statistics per REQ-GRAD-006/009.
/// Shows counts by pillar stage for a project/cohort.
/// </summary>
public class GraduationPipelineDto
{
    public Guid ProjectId { get; set; }
    public int TotalParticipants { get; set; }
    public int P1Count { get; set; }
    public int P2Count { get; set; }
    public int P3Count { get; set; }
    public int P4Count { get; set; }
    public int GraduatedCount { get; set; }
    public decimal GraduationRate { get; set; }
}
