using NGO.PMS.Projects.Domain.Enums;
using NGO.PMS.Projects.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

public class Project : AuditableEntity, ISoftDeletable
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ProjectStatus Status { get; private set; } = ProjectStatus.Draft;
    public OperationalStatus OperationalStatus { get; private set; } = OperationalStatus.NotStarted;
    public DateTimeOffset StartDate { get; private set; }
    public DateTimeOffset EndDate { get; private set; }
    public decimal TotalBudget { get; private set; }
    public Guid CurrencyId { get; private set; }
    public string? DonorName { get; private set; }
    public string? Sector { get; private set; }
    public string? ProgramPillar { get; private set; }

    // Beneficiary disaggregation
    public int DirectBeneficiariesMale { get; private set; }
    public int DirectBeneficiariesFemale { get; private set; }
    public int IndirectBeneficiariesMale { get; private set; }
    public int IndirectBeneficiariesFemale { get; private set; }
    public int BeneficiariesPwd { get; private set; }

    // Narrative fields
    public string? Assumptions { get; private set; }
    public string? Risks { get; private set; }
    public string? MeansOfVerification { get; private set; }
    public string? Scope { get; private set; }

    // Approval workflow
    public Guid? ApprovedBy { get; private set; }
    public DateTimeOffset? ApprovedAt { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? SubmittedBy { get; private set; }
    public DateTimeOffset? SubmittedAt { get; private set; }

    // Relationships
    public Guid? OfficeId { get; set; }
    public Guid? ProjectManagerId { get; set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<Outcome> Outcomes { get; private set; } = [];
    public ICollection<ProjectTeamMember> TeamMembers { get; private set; } = [];
    public ICollection<ProjectRevision> Revisions { get; private set; } = [];
    public ICollection<ProjectInterventionArea> InterventionAreas { get; private set; } = [];

    public int TotalDirectBeneficiaries => DirectBeneficiariesMale + DirectBeneficiariesFemale;
    public int TotalIndirectBeneficiaries => IndirectBeneficiariesMale + IndirectBeneficiariesFemale;

    public static Project Create(
        string code, string name, DateTimeOffset startDate, DateTimeOffset endDate,
        decimal totalBudget, Guid currencyId, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Project code is required.", nameof(code));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Project name is required.", nameof(name));
        if (endDate <= startDate) throw new ArgumentException("End date must be after start date.", nameof(endDate));

        var project = new Project
        {
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            StartDate = startDate,
            EndDate = endDate,
            TotalBudget = totalBudget,
            CurrencyId = currencyId,
            OrganizationId = orgId,
            Status = ProjectStatus.Draft,
            OperationalStatus = OperationalStatus.NotStarted
        };
        project.AddDomainEvent(new ProjectCreatedEvent(project.Id, project.Code, project.Name));
        return project;
    }

    public void Update(string name, string? description, DateTimeOffset startDate, DateTimeOffset endDate,
        decimal totalBudget, string? donorName, string? sector, string? programPillar)
    {
        if (Status == ProjectStatus.Approved)
            throw new InvalidOperationException("Approved projects require an amendment to edit.");

        Name = name.Trim();
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
        TotalBudget = totalBudget;
        DonorName = donorName;
        Sector = sector;
        ProgramPillar = programPillar;
    }

    public void UpdateBeneficiaries(int directMale, int directFemale, int indirectMale, int indirectFemale, int pwd)
    {
        DirectBeneficiariesMale = directMale;
        DirectBeneficiariesFemale = directFemale;
        IndirectBeneficiariesMale = indirectMale;
        IndirectBeneficiariesFemale = indirectFemale;
        BeneficiariesPwd = pwd;
    }

    public void UpdateNarrative(string? assumptions, string? risks, string? meansOfVerification, string? scope)
    {
        Assumptions = assumptions;
        Risks = risks;
        MeansOfVerification = meansOfVerification;
        Scope = scope;
    }

    public void Submit(Guid submittedBy)
    {
        if (Status != ProjectStatus.Draft && Status != ProjectStatus.Rejected)
            throw new InvalidOperationException("Only draft or rejected projects can be submitted.");
        Status = ProjectStatus.Submitted;
        SubmittedBy = submittedBy;
        SubmittedAt = DateTimeOffset.UtcNow;
    }

    public void Approve(Guid approvedBy)
    {
        if (Status != ProjectStatus.Submitted)
            throw new InvalidOperationException("Only submitted projects can be approved.");
        Status = ProjectStatus.Approved;
        ApprovedBy = approvedBy;
        ApprovedAt = DateTimeOffset.UtcNow;
        RejectionReason = null;
        AddDomainEvent(new ProjectApprovedEvent(Id, approvedBy));
    }

    public void Reject(string reason)
    {
        if (Status != ProjectStatus.Submitted)
            throw new InvalidOperationException("Only submitted projects can be rejected.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required.", nameof(reason));
        Status = ProjectStatus.Rejected;
        RejectionReason = reason;
    }

    public void Close(Guid closedBy, string reason)
    {
        if (OperationalStatus == OperationalStatus.Completed || OperationalStatus == OperationalStatus.Cancelled)
            throw new InvalidOperationException("Project is already closed.");
        OperationalStatus = OperationalStatus.Completed;
        AddDomainEvent(new ProjectClosedEvent(Id, closedBy, reason));
    }

    public void Suspend() => OperationalStatus = OperationalStatus.Suspended;
    public void Resume() => OperationalStatus = OperationalStatus.InProgress;
    public void StartOperations() => OperationalStatus = OperationalStatus.InProgress;
    public void Cancel(Guid cancelledBy, string reason)
    {
        OperationalStatus = OperationalStatus.Cancelled;
        AddDomainEvent(new ProjectClosedEvent(Id, cancelledBy, reason));
    }
}
