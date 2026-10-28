using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.SystemSettings.Queries.GetSystemSettings;

public class GetSystemSettingsQueryHandler : IRequestHandler<GetSystemSettingsQuery, List<SystemSettingDto>>
{
    private readonly ISettingsDbContext _db;
    private readonly IMapper _mapper;

    public GetSystemSettingsQueryHandler(ISettingsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<SystemSettingDto>> Handle(GetSystemSettingsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.SystemSettings.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(s => s.Category == request.Category);

        return await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.SettingKey)
            .ProjectTo<SystemSettingDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
