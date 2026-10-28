using MediatR;
using NGO.PMS.Documents.Domain.Enums;

namespace NGO.PMS.Documents.Application.Commands.Documents.UploadDocument;

public sealed record UploadDocumentCommand(
    string FileName,
    string ContentType,
    long FileSizeBytes,
    string StorageUrl,
    Guid? FolderId = null,
    string? DisplayName = null,
    string? Description = null,
    DocumentCategory Category = DocumentCategory.General,
    string? Tags = null,
    Guid? LinkedEntityId = null,
    string? LinkedEntityType = null) : IRequest<Guid>;
