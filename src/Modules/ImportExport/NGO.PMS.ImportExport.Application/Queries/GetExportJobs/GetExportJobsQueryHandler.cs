using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetExportJobs;

public sealed class GetExportJobsQueryHandler : IRequestHandler<GetExportJobsQuery, List<ExportJobDto>>
{
    private readonly IImportExportDbContext _db;
    private readonly IMapper _mapper;

    public GetExportJobsQueryHandler(IImportExportDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ExportJobDto>> Handle(GetExportJobsQuery request, CancellationToken ct)
    {
        var query = _db.ExportJobs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(j => j.Module == request.Module);

        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(ct);

        return _mapper.Map<List<ExportJobDto>>(jobs);
    }
}
