using MediatR;
using NGO.PMS.Documents.Domain.Enums;

namespace NGO.PMS.Documents.Application.Commands.Documents.UpdateDocumentMetadata;

public sealed record UpdateDocumentMetadataCommand(
    Guid DocumentId,
    string? DisplayName,
    string? Description,
    DocumentCategory Category,
    string? Tags,
    Guid? LinkedEntityId,
    string? LinkedEntityType) : IRequest<Unit>;
