using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Queries.GetPartnerReportById;

public sealed class GetPartnerReportByIdQueryHandler : IRequestHandler<GetPartnerReportByIdQuery, PartnerReportDto>
{
    private readonly IPartnershipsDbContext _db;
    private readonly IMapper _mapper;

    public GetPartnerReportByIdQueryHandler(IPartnershipsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<PartnerReportDto> Handle(GetPartnerReportByIdQuery request, CancellationToken ct)
    {
        var entity = await _db.PartnerReports
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.PartnerReport), request.Id);

        return _mapper.Map<PartnerReportDto>(entity);
    }
}
