using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Settings.Application.SystemSettings.Commands.UpdateSystemSetting;

public class UpdateSystemSettingCommandHandler : IRequestHandler<UpdateSystemSettingCommand>
{
    private readonly ISettingsDbContext _db;

    public UpdateSystemSettingCommandHandler(ISettingsDbContext db)
    {
        _db = db;
    }

    public async Task Handle(UpdateSystemSettingCommand request, CancellationToken cancellationToken)
    {
        var setting = await _db.SystemSettings
            .FirstOrDefaultAsync(s => s.SettingKey == request.SettingKey, cancellationToken)
            ?? throw new NotFoundException("SystemSetting", request.SettingKey);

        setting.Update(request.SettingValue);

        await _db.SaveChangesAsync(cancellationToken);
    }
}
