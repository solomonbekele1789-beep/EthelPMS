using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportTemplates;

public sealed class GetImportTemplatesQueryHandler : IRequestHandler<GetImportTemplatesQuery, List<ImportTemplateDto>>
{
    private readonly IImportExportDbContext _db;
    private readonly IMapper _mapper;

    public GetImportTemplatesQueryHandler(IImportExportDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ImportTemplateDto>> Handle(GetImportTemplatesQuery request, CancellationToken ct)
    {
        var query = _db.ImportTemplates.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(t => t.Module == request.Module);

        var templates = await query
            .OrderBy(t => t.Name)
            .ToListAsync(ct);

        return _mapper.Map<List<ImportTemplateDto>>(templates);
    }
}
