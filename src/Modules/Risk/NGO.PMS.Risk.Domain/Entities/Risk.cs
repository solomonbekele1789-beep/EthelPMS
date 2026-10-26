using NGO.PMS.Risk.Domain.Enums;
using NGO.PMS.Risk.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Domain.Entities;

public class Risk : AuditableEntity, ISoftDeletable
{
    public Guid ProjectId { get; private set; }
    public Guid? RiskCategoryId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Likelihood Likelihood { get; private set; }
    public Impact Impact { get; private set; }
    public int RiskScore { get; private set; }
    public RiskStatus Status { get; private set; }
    public string? Owner { get; private set; }
    public Guid? OwnerUserId { get; private set; }
    public string? Location { get; private set; }
    public DateTime IdentifiedDate { get; private set; }
    public DateTime? ResolvedDate { get; private set; }
    public string? ResidualRiskNotes { get; private set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<RiskMitigation> Mitigations { get; private set; } = [];
    public ICollection<RiskAssessment> Assessments { get; private set; } = [];

    private Risk() { }

    public static Risk Create(
        Guid projectId,
        string title,
        string description,
        Likelihood likelihood,
        Impact impact,
        Guid organizationId,
        Guid? riskCategoryId = null,
        string? owner = null,
        Guid? ownerUserId = null,
        string? location = null,
        string? residualRiskNotes = null)
    {
        var risk = new Risk
        {
            ProjectId = projectId,
            Title = title,
            Description = description,
            Likelihood = likelihood,
            Impact = impact,
            RiskScore = (int)likelihood * (int)impact,
            Status = RiskStatus.Identified,
            OrganizationId = organizationId,
            RiskCategoryId = riskCategoryId,
            Owner = owner,
            OwnerUserId = ownerUserId,
            Location = location,
            ResidualRiskNotes = residualRiskNotes,
            IdentifiedDate = DateTime.UtcNow
        };

        risk.AddDomainEvent(new RiskIdentifiedEvent(risk.Id, risk.ProjectId, risk.RiskScore));

        return risk;
    }

    public void Reassess(Likelihood likelihood, Impact impact)
    {
        var previousScore = RiskScore;
        Likelihood = likelihood;
        Impact = impact;
        RiskScore = (int)likelihood * (int)impact;
        Status = RiskStatus.Assessed;

        if (RiskScore > previousScore)
        {
            AddDomainEvent(new RiskEscalatedEvent(Id, previousScore, RiskScore));
        }
    }

    public void Resolve()
    {
        Status = RiskStatus.Resolved;
        ResolvedDate = DateTime.UtcNow;
    }

    public void Accept()
    {
        Status = RiskStatus.Accepted;
    }

    public void Close()
    {
        var hasOpenMitigations = Mitigations.Any(m =>
            m.Status != MitigationStatus.Completed);

        if (hasOpenMitigations)
        {
            throw new InvalidOperationException(
                "Cannot close a risk with open mitigations. Complete or remove all mitigations first.");
        }

        Status = RiskStatus.Closed;
    }
}
