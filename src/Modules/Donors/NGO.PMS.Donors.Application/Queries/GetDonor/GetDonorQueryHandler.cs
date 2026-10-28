using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Queries.GetDonor;

public sealed class GetDonorQueryHandler : IRequestHandler<GetDonorQuery, DonorDto>
{
    private readonly IDonorsDbContext _db;
    private readonly IMapper _mapper;

    public GetDonorQueryHandler(IDonorsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<DonorDto> Handle(GetDonorQuery request, CancellationToken ct)
    {
        var donor = await _db.Donors
            .AsNoTracking()
            .Include(d => d.Contacts)
            .Include(d => d.Grants)
            .FirstOrDefaultAsync(d => d.Id == request.DonorId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Donor), request.DonorId);

        return _mapper.Map<DonorDto>(donor);
    }
}
