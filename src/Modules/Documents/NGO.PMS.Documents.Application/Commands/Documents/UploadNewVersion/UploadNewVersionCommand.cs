using MediatR;

namespace NGO.PMS.Documents.Application.Commands.Documents.UploadNewVersion;

public sealed record UploadNewVersionCommand(
    Guid DocumentId,
    string StorageUrl,
    long FileSizeBytes,
    string ContentType,
    string? ChangeNotes = null) : IRequest<Guid>;
