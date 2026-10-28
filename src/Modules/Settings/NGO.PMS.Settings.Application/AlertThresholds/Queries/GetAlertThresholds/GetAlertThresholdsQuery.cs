using MediatR;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.AlertThresholds.Queries.GetAlertThresholds;

public record GetAlertThresholdsQuery(string? Module = null) : IRequest<List<AlertThresholdDto>>;
