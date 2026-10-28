using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Graduation.Queries.ListBenchmarks;

public class ListBenchmarksQueryHandler
    : IRequestHandler<ListBenchmarksQuery, List<GraduationBenchmarkDto>>
{
    private readonly IParticipantsDbContext _db;
    private readonly IMapper _mapper;

    public ListBenchmarksQueryHandler(IParticipantsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<GraduationBenchmarkDto>> Handle(
        ListBenchmarksQuery request, CancellationToken cancellationToken)
    {
        var query = _db.GraduationBenchmarks.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(b =>
                b.ProjectId == request.ProjectId.Value || b.ProjectId == null);

        if (request.ActiveOnly == true)
            query = query.Where(b => b.IsActive);

        return await query
            .OrderBy(b => b.Domain)
            .ThenBy(b => b.Name)
            .ProjectTo<GraduationBenchmarkDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
