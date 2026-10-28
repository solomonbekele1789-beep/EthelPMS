using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.FundAccounting.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class Budget : AuditableEntity
{
    public string Title { get; private set; } = null!;
    public Guid ProjectId { get; private set; }
    public int FiscalYear { get; private set; }
    public BudgetStatus Status { get; private set; }
    public string CurrencyCode { get; private set; } = null!;
    public decimal ExchangeRate { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public int Version { get; private set; }
    public Guid OrganizationId { get; set; }

    // Navigation properties
    public List<BudgetLine> Lines { get; private set; } = [];
    public List<BudgetRevision> Revisions { get; private set; } = [];

    private Budget() { }

    public static Budget Create(
        string title,
        Guid projectId,
        int fiscalYear,
        string currencyCode,
        decimal exchangeRate,
        Guid orgId)
    {
        var budget = new Budget
        {
            Title = title,
            ProjectId = projectId,
            FiscalYear = fiscalYear,
            Status = BudgetStatus.Draft,
            CurrencyCode = currencyCode,
            ExchangeRate = exchangeRate,
            TotalAmount = 0,
            Version = 1,
            OrganizationId = orgId
        };

        return budget;
    }

    public void AddLine(
        Guid accountId,
        string description,
        decimal q1Amount,
        decimal q2Amount,
        decimal q3Amount,
        decimal q4Amount)
    {
        var line = BudgetLine.Create(Id, accountId, description, q1Amount, q2Amount, q3Amount, q4Amount, OrganizationId);
        Lines.Add(line);
        RecalculateTotal();
    }

    public void Submit()
    {
        if (Status != BudgetStatus.Draft && Status != BudgetStatus.Rejected)
            throw new InvalidOperationException("Only draft or rejected budgets can be submitted.");

        if (Lines.Count == 0)
            throw new InvalidOperationException("Cannot submit a budget with no lines.");

        Status = BudgetStatus.Submitted;
    }

    public void Approve(Guid approvedBy)
    {
        if (Status != BudgetStatus.Submitted)
            throw new InvalidOperationException("Only submitted budgets can be approved.");

        Status = BudgetStatus.Approved;
        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;

        AddDomainEvent(new BudgetApprovedEvent(Id, ProjectId));
    }

    public void Reject(string reason)
    {
        if (Status != BudgetStatus.Submitted)
            throw new InvalidOperationException("Only submitted budgets can be rejected.");

        Status = BudgetStatus.Rejected;
        RejectionReason = reason;
    }

    private void RecalculateTotal()
    {
        TotalAmount = Lines.Sum(l => l.AnnualAmount);
    }
}
