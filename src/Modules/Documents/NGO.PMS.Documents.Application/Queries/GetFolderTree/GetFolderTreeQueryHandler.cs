using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Queries.GetFolderTree;

public sealed class GetFolderTreeQueryHandler : IRequestHandler<GetFolderTreeQuery, List<FolderTreeDto>>
{
    private readonly IDocumentsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetFolderTreeQueryHandler(IDocumentsDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<List<FolderTreeDto>> Handle(GetFolderTreeQuery request, CancellationToken cancellationToken)
    {
        var query = _db.DocumentFolders.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(f => f.ProjectId == request.ProjectId.Value);

        var folders = await query
            .Include(f => f.SubFolders)
            .Where(f => f.ParentFolderId == null)
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.Name)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<FolderTreeDto>>(folders);
    }
}
