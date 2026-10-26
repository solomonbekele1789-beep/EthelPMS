using MediatR;
using NGO.PMS.Documents.Application.DTOs;

namespace NGO.PMS.Documents.Application.Queries.ListDocumentVersions;

public sealed record ListDocumentVersionsQuery(Guid DocumentId) : IRequest<List<DocumentVersionDto>>;
