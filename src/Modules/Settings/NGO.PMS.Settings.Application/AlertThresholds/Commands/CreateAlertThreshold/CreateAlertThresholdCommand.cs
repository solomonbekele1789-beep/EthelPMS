using MediatR;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.CreateAlertThreshold;

public record CreateAlertThresholdCommand(
    string Module,
    string MetricName,
    decimal ThresholdValue,
    ComparisonOperator Operator,
    AlertSeverity AlertSeverity,
    bool IsActive) : IRequest<Guid>;
