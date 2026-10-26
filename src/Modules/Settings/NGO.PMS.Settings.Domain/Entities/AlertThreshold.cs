using NGO.PMS.Settings.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Domain.Entities;

public class AlertThreshold : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; set; }
    public string Module { get; private set; } = string.Empty;
    public string MetricName { get; private set; } = string.Empty;
    public decimal ThresholdValue { get; private set; }
    public ComparisonOperator Operator { get; private set; }
    public AlertSeverity AlertSeverity { get; private set; }
    public bool IsActive { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private AlertThreshold() { }

    public static AlertThreshold Create(
        Guid organizationId,
        string module,
        string metricName,
        decimal thresholdValue,
        ComparisonOperator @operator,
        AlertSeverity alertSeverity,
        bool isActive)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(module);
        ArgumentException.ThrowIfNullOrWhiteSpace(metricName);

        return new AlertThreshold
        {
            OrganizationId = organizationId,
            Module = module,
            MetricName = metricName,
            ThresholdValue = thresholdValue,
            Operator = @operator,
            AlertSeverity = alertSeverity,
            IsActive = isActive
        };
    }

    public void Update(decimal thresholdValue, ComparisonOperator @operator, AlertSeverity alertSeverity, bool isActive)
    {
        ThresholdValue = thresholdValue;
        Operator = @operator;
        AlertSeverity = alertSeverity;
        IsActive = isActive;
    }
}
