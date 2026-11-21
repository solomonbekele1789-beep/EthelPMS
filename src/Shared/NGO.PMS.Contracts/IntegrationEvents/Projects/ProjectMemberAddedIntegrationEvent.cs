namespace NGO.PMS.Contracts.IntegrationEvents.Projects;

public sealed record ProjectMemberAddedIntegrationEvent(
    Guid ProjectId,
    Guid UserId,
    string Role) : IntegrationEvent;
