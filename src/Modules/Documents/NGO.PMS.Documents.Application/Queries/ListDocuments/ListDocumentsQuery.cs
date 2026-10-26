using MediatR;
using NGO.PMS.Documents.Application.DTOs;
using NGO.PMS.Documents.Domain.Enums;

namespace NGO.PMS.Documents.Application.Queries.ListDocuments;

public sealed record ListDocumentsQuery(
    Guid? FolderId = null,
    DocumentCategory? Category = null,
    DocumentStatus? Status = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<DocumentDto>>;
