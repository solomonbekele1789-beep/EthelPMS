using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Offices.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Offices.Queries.GetOffice;

public class GetOfficeQueryHandler : IRequestHandler<GetOfficeQuery, OfficeDto>
{
    private readonly IIdentityDbContext _db;
    private readonly IMapper _mapper;
    public GetOfficeQueryHandler(IIdentityDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

    public async Task<OfficeDto> Handle(GetOfficeQuery request, CancellationToken cancellationToken)
    {
        var office = await _db.Offices.Include(o => o.ParentOffice).Include(o => o.Location)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Office", request.Id);
        return _mapper.Map<OfficeDto>(office);
    }
}
