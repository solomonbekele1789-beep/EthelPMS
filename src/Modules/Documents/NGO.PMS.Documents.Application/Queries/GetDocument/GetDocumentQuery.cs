using MediatR;
using NGO.PMS.Documents.Application.DTOs;

namespace NGO.PMS.Documents.Application.Queries.GetDocument;

public sealed record GetDocumentQuery(Guid DocumentId) : IRequest<DocumentDto>;
