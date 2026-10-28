namespace NGO.PMS.Participants.Domain.Enums;

/// <summary>
/// Graduation pipeline stages per REQ-GRAD-002.
/// P1 = entry, P2 = >=25%, P3 = >=50%, P4 = >=80%.
/// </summary>
public enum PillarStage
{
    P1 = 1,
    P2 = 2,
    P3 = 3,
    P4 = 4
}
