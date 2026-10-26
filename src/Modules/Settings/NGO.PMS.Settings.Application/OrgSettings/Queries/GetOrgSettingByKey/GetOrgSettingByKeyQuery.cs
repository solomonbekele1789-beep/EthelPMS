using MediatR;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.OrgSettings.Queries.GetOrgSettingByKey;

public record GetOrgSettingByKeyQuery(string SettingKey) : IRequest<OrgSettingDto?>;
