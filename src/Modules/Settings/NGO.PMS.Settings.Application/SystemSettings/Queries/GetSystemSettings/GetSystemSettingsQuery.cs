using MediatR;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.SystemSettings.Queries.GetSystemSettings;

public record GetSystemSettingsQuery(string? Category = null) : IRequest<List<SystemSettingDto>>;
