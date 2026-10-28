using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Entities;

/// <summary>
/// Tracks services delivered to a participant across projects.
/// Links to activities and supports service delivery reporting.
/// </summary>
public class ParticipantService : AuditableEntity
{
    public Guid ParticipantId { get; private set; }
    public Guid ProjectId { get; private set; }
    public Guid? ActivityId { get; private set; }
    public string ServiceName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTimeOffset ServiceDate { get; private set; }
    public decimal? Quantity { get; private set; }
    public string? Unit { get; private set; }
    public string? DeliveredByUserId { get; private set; }
    public string? Notes { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Participant? Participant { get; private set; }

    public static ParticipantService Create(
        Guid participantId, Guid projectId, string serviceName,
        DateTimeOffset serviceDate, Guid orgId,
        Guid? activityId = null, string? description = null,
        decimal? quantity = null, string? unit = null)
    {
        if (string.IsNullOrWhiteSpace(serviceName))
            throw new ArgumentException("Service name is required.", nameof(serviceName));

        return new ParticipantService
        {
            ParticipantId = participantId,
            ProjectId = projectId,
            ActivityId = activityId,
            ServiceName = serviceName.Trim(),
            Description = description,
            ServiceDate = serviceDate,
            Quantity = quantity,
            Unit = unit,
            OrganizationId = orgId
        };
    }

    public void Update(string serviceName, string? description, decimal? quantity,
        string? unit, string? notes)
    {
        if (string.IsNullOrWhiteSpace(serviceName))
            throw new ArgumentException("Service name is required.", nameof(serviceName));
        ServiceName = serviceName.Trim();
        Description = description;
        Quantity = quantity;
        Unit = unit;
        Notes = notes;
    }
}
