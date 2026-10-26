using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.OrgSettings.Queries.GetOrgSettings;

public class GetOrgSettingsQueryHandler : IRequestHandler<GetOrgSettingsQuery, List<OrgSettingDto>>
{
    private readonly ISettingsDbContext _db;
    private readonly IMapper _mapper;

    public GetOrgSettingsQueryHandler(ISettingsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<OrgSettingDto>> Handle(GetOrgSettingsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.OrgSettings.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(s => s.Module == request.Module);

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(s => s.Category == request.Category);

        return await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.SettingKey)
            .ProjectTo<OrgSettingDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
