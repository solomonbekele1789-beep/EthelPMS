using NGO.PMS.Donors.Domain.Enums;
using NGO.PMS.Donors.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Entities;

public class Grant : AuditableEntity, IMultiTenant
{
    public Guid DonorId { get; private set; }
    public string GrantNumber { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public GrantStatus Status { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public ComplianceStatus ComplianceStatus { get; private set; } = ComplianceStatus.Green;
    public string? Description { get; private set; }
    public Guid? ProjectId { get; private set; }
    public decimal? CoFinancingAmount { get; private set; }
    public string? CoFinancingPartner { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    // Navigation
    private readonly List<GrantCondition> _conditions = [];
    public IReadOnlyList<GrantCondition> Conditions => _conditions.AsReadOnly();

    private readonly List<GrantReport> _reports = [];
    public IReadOnlyList<GrantReport> Reports => _reports.AsReadOnly();

    private Grant() { }

    public static Grant Create(Guid donorId, string grantNumber, string title, GrantStatus status,
        decimal totalAmount, string currencyCode, DateTime startDate, DateTime endDate,
        string? description, Guid? projectId)
    {
        if (donorId == Guid.Empty)
            throw new ArgumentException("Donor ID is required.", nameof(donorId));
        if (string.IsNullOrWhiteSpace(grantNumber))
            throw new ArgumentException("Grant number is required.", nameof(grantNumber));
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Grant title is required.", nameof(title));
        if (totalAmount <= 0)
            throw new ArgumentException("Total amount must be greater than zero.", nameof(totalAmount));
        if (endDate <= startDate)
            throw new ArgumentException("End date must be after start date.", nameof(endDate));

        var grant = new Grant
        {
            DonorId = donorId,
            GrantNumber = grantNumber,
            Title = title,
            Status = status,
            TotalAmount = totalAmount,
            CurrencyCode = currencyCode,
            StartDate = startDate,
            EndDate = endDate,
            ComplianceStatus = ComplianceStatus.Green,
            Description = description,
            ProjectId = projectId
        };

        if (status == GrantStatus.Active)
        {
            grant.AddDomainEvent(new GrantActivatedEvent(grant.Id, donorId, totalAmount));
        }

        return grant;
    }

    public void Activate()
    {
        if (Status != GrantStatus.Draft)
            throw new InvalidOperationException("Only draft grants can be activated.");

        Status = GrantStatus.Active;
        AddDomainEvent(new GrantActivatedEvent(Id, DonorId, TotalAmount));
    }

    public void Suspend()
    {
        if (Status != GrantStatus.Active)
            throw new InvalidOperationException("Only active grants can be suspended.");

        Status = GrantStatus.Suspended;
    }

    public void Complete()
    {
        if (Status != GrantStatus.Active)
            throw new InvalidOperationException("Only active grants can be completed.");

        Status = GrantStatus.Completed;
    }

    public void Terminate()
    {
        if (Status == GrantStatus.Completed || Status == GrantStatus.Terminated)
            throw new InvalidOperationException("Grant is already completed or terminated.");

        Status = GrantStatus.Terminated;
    }

    public void UpdateComplianceStatus(ComplianceStatus newStatus)
    {
        if (ComplianceStatus == newStatus)
            return;

        var oldStatus = ComplianceStatus;
        ComplianceStatus = newStatus;
        AddDomainEvent(new ComplianceStatusChangedEvent(Id, oldStatus, newStatus));
    }

    /// <summary>
    /// RAG computation (REQ-DON-002):
    /// Green if no overdue conditions, Amber if any condition due within 30 days, Red if any condition overdue.
    /// </summary>
    public ComplianceStatus ComputeComplianceStatus()
    {
        var now = DateTime.UtcNow;

        if (_conditions.Any(c => c.Status == ConditionStatus.Overdue ||
            (c.Status == ConditionStatus.Pending && c.DueDate < now)))
        {
            return ComplianceStatus.Red;
        }

        if (_conditions.Any(c => c.Status == ConditionStatus.Pending &&
            c.DueDate <= now.AddDays(30) && c.DueDate >= now))
        {
            return ComplianceStatus.Amber;
        }

        return ComplianceStatus.Green;
    }

    public void AddCoFinancing(string partner, decimal amount)
    {
        if (string.IsNullOrWhiteSpace(partner))
            throw new ArgumentException("Co-financing partner is required.", nameof(partner));
        if (amount <= 0)
            throw new ArgumentException("Co-financing amount must be greater than zero.", nameof(amount));

        CoFinancingPartner = partner;
        CoFinancingAmount = amount;
    }
}
