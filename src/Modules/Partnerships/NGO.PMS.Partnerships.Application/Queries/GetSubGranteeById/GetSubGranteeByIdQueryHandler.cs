using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Queries.GetSubGranteeById;

public sealed class GetSubGranteeByIdQueryHandler : IRequestHandler<GetSubGranteeByIdQuery, SubGranteeDto>
{
    private readonly IPartnershipsDbContext _db;
    private readonly IMapper _mapper;

    public GetSubGranteeByIdQueryHandler(IPartnershipsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<SubGranteeDto> Handle(GetSubGranteeByIdQuery request, CancellationToken ct)
    {
        var entity = await _db.SubGrantees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.SubGrantee), request.Id);

        return _mapper.Map<SubGranteeDto>(entity);
    }
}
