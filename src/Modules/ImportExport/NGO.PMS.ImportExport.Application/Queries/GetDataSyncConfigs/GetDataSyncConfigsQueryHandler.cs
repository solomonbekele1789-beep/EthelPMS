using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetDataSyncConfigs;

public sealed class GetDataSyncConfigsQueryHandler : IRequestHandler<GetDataSyncConfigsQuery, List<DataSyncConfigDto>>
{
    private readonly IImportExportDbContext _db;
    private readonly IMapper _mapper;

    public GetDataSyncConfigsQueryHandler(IImportExportDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<DataSyncConfigDto>> Handle(GetDataSyncConfigsQuery request, CancellationToken ct)
    {
        var configs = await _db.DataSyncConfigs
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

        return _mapper.Map<List<DataSyncConfigDto>>(configs);
    }
}
