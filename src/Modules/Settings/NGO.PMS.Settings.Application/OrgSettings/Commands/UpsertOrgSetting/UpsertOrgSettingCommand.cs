using MediatR;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Application.OrgSettings.Commands.UpsertOrgSetting;

public record UpsertOrgSettingCommand(
    string SettingKey,
    string SettingValue,
    SettingDataType DataType,
    string? Module,
    string Category) : IRequest<Guid>;
