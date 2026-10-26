using MediatR;

namespace NGO.PMS.Settings.Application.SystemSettings.Commands.UpdateSystemSetting;

public record UpdateSystemSettingCommand(
    string SettingKey,
    string SettingValue) : IRequest;
