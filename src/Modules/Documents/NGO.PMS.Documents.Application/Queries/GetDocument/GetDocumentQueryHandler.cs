using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Queries.GetDocument;

public sealed class GetDocumentQueryHandler : IRequestHandler<GetDocumentQuery, DocumentDto>
{
    private readonly IDocumentsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetDocumentQueryHandler(IDocumentsDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<DocumentDto> Handle(GetDocumentQuery request, CancellationToken cancellationToken)
    {
        var document = await _db.Documents
            .Include(d => d.Versions)
            .Include(d => d.Comments)
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken)
            ?? throw new InvalidOperationException($"Document {request.DocumentId} not found.");

        return _mapper.Map<DocumentDto>(document);
    }
}
