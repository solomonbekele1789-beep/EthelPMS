using MediatR;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.DeleteAlertThreshold;

public record DeleteAlertThresholdCommand(Guid Id) : IRequest;
