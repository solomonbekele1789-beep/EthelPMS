using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.OrgSettings.Queries.GetOrgSettingByKey;

public class GetOrgSettingByKeyQueryHandler : IRequestHandler<GetOrgSettingByKeyQuery, OrgSettingDto?>
{
    private readonly ISettingsDbContext _db;
    private readonly IMapper _mapper;

    public GetOrgSettingByKeyQueryHandler(ISettingsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<OrgSettingDto?> Handle(GetOrgSettingByKeyQuery request, CancellationToken cancellationToken)
    {
        var setting = await _db.OrgSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.SettingKey == request.SettingKey, cancellationToken);

        return setting is null ? null : _mapper.Map<OrgSettingDto>(setting);
    }
}
