using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportJobs;

public sealed class GetImportJobsQueryHandler : IRequestHandler<GetImportJobsQuery, List<ImportJobListDto>>
{
    private readonly IImportExportDbContext _db;
    private readonly IMapper _mapper;

    public GetImportJobsQueryHandler(IImportExportDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ImportJobListDto>> Handle(GetImportJobsQuery request, CancellationToken ct)
    {
        var query = _db.ImportJobs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(j => j.Module == request.Module);

        if (request.Status.HasValue)
            query = query.Where(j => j.Status == request.Status.Value);

        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(ct);

        return _mapper.Map<List<ImportJobListDto>>(jobs);
    }
}
