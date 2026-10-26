using MediatR;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.OrgSettings.Queries.GetOrgSettings;

public record GetOrgSettingsQuery(string? Module = null, string? Category = null) : IRequest<List<OrgSettingDto>>;
