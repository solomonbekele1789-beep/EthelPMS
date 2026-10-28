namespace NGO.PMS.MEAL.Domain.Enums;

/// <summary>
/// Tracks management response workflow per REQ-MEAL-015/016.
/// </summary>
public enum FindingStatus
{
    Open = 1,
    ResponseProvided = 2,
    Verified = 3,
    Closed = 4
}
