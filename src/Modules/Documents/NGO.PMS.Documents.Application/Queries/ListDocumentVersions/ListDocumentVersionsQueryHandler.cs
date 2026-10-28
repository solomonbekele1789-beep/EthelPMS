using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Queries.ListDocumentVersions;

public sealed class ListDocumentVersionsQueryHandler : IRequestHandler<ListDocumentVersionsQuery, List<DocumentVersionDto>>
{
    private readonly IDocumentsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListDocumentVersionsQueryHandler(IDocumentsDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<List<DocumentVersionDto>> Handle(ListDocumentVersionsQuery request, CancellationToken cancellationToken)
    {
        return await _db.DocumentVersions
            .Where(v => v.DocumentId == request.DocumentId)
            .OrderByDescending(v => v.VersionNumber)
            .ProjectTo<DocumentVersionDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
