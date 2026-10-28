using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class BidEvaluation : AuditableEntity, IMultiTenant
{
    private BidEvaluation() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public Guid RfqId { get; private set; }
    public Guid RfqResponseId { get; private set; }
    public Guid SupplierId { get; private set; }
    public decimal TechnicalScore { get; private set; }
    public decimal FinancialScore { get; private set; }
    public decimal TotalWeightedScore { get; private set; }
    public decimal TechnicalWeight { get; private set; } = 0.7m;
    public decimal FinancialWeight { get; private set; } = 0.3m;
    public string? EvaluationNotes { get; private set; }
    public bool IsWinner { get; private set; }

    public static BidEvaluation Create(
        Guid rfqId,
        Guid responseId,
        Guid supplierId,
        decimal technicalScore,
        decimal financialScore,
        decimal technicalWeight,
        decimal financialWeight,
        Guid orgId)
    {
        if (technicalScore < 0 || technicalScore > 100)
            throw new ArgumentOutOfRangeException(nameof(technicalScore), "Technical score must be between 0 and 100.");

        if (financialScore < 0 || financialScore > 100)
            throw new ArgumentOutOfRangeException(nameof(financialScore), "Financial score must be between 0 and 100.");

        var evaluation = new BidEvaluation
        {
            RfqId = rfqId,
            RfqResponseId = responseId,
            SupplierId = supplierId,
            TechnicalScore = technicalScore,
            FinancialScore = financialScore,
            TechnicalWeight = technicalWeight,
            FinancialWeight = financialWeight,
            OrganizationId = orgId
        };

        evaluation.TotalWeightedScore =
            technicalScore * technicalWeight + financialScore * financialWeight;

        return evaluation;
    }

    public void MarkAsWinner()
    {
        IsWinner = true;
    }
}
