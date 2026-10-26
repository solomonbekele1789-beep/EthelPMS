using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportJobById;

public sealed class GetImportJobByIdQueryHandler : IRequestHandler<GetImportJobByIdQuery, ImportJobDto>
{
    private readonly IImportExportDbContext _db;
    private readonly IMapper _mapper;

    public GetImportJobByIdQueryHandler(IImportExportDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ImportJobDto> Handle(GetImportJobByIdQuery request, CancellationToken ct)
    {
        var job = await _db.ImportJobs
            .AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ImportJob), request.Id);

        return _mapper.Map<ImportJobDto>(job);
    }
}
