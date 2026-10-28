using MediatR;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.UpdateAlertThreshold;

public record UpdateAlertThresholdCommand(
    Guid Id,
    decimal ThresholdValue,
    ComparisonOperator Operator,
    AlertSeverity AlertSeverity,
    bool IsActive) : IRequest;
