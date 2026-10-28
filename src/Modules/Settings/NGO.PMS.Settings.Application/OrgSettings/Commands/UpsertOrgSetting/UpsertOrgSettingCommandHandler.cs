using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Application.OrgSettings.Commands.UpsertOrgSetting;

public class UpsertOrgSettingCommandHandler : IRequestHandler<UpsertOrgSettingCommand, Guid>
{
    private readonly ISettingsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpsertOrgSettingCommandHandler(ISettingsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(UpsertOrgSettingCommand request, CancellationToken cancellationToken)
    {
        var existing = await _db.OrgSettings
            .FirstOrDefaultAsync(s =>
                s.OrganizationId == _currentUser.OrganizationId &&
                s.SettingKey == request.SettingKey, cancellationToken);

        if (existing is not null)
        {
            existing.Update(request.SettingValue, request.DataType);
            await _db.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }

        var setting = OrgSetting.Create(
            _currentUser.OrganizationId,
            request.SettingKey,
            request.SettingValue,
            request.DataType,
            request.Module,
            request.Category);

        _db.OrgSettings.Add(setting);
        await _db.SaveChangesAsync(cancellationToken);

        return setting.Id;
    }
}
