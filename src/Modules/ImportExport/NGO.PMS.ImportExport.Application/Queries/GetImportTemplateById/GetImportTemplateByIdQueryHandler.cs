using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportTemplateById;

public sealed class GetImportTemplateByIdQueryHandler : IRequestHandler<GetImportTemplateByIdQuery, ImportTemplateDto>
{
    private readonly IImportExportDbContext _db;
    private readonly IMapper _mapper;

    public GetImportTemplateByIdQueryHandler(IImportExportDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ImportTemplateDto> Handle(GetImportTemplateByIdQuery request, CancellationToken ct)
    {
        var template = await _db.ImportTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ImportTemplate), request.Id);

        return _mapper.Map<ImportTemplateDto>(template);
    }
}
