using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Queries.GetGrant;

public sealed class GetGrantQueryHandler : IRequestHandler<GetGrantQuery, GrantDto>
{
    private readonly IDonorsDbContext _db;
    private readonly IMapper _mapper;

    public GetGrantQueryHandler(IDonorsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<GrantDto> Handle(GetGrantQuery request, CancellationToken ct)
    {
        var grant = await _db.Grants
            .AsNoTracking()
            .Include(g => g.Conditions)
            .Include(g => g.Reports)
            .FirstOrDefaultAsync(g => g.Id == request.GrantId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Grant), request.GrantId);

        return _mapper.Map<GrantDto>(grant);
    }
}
