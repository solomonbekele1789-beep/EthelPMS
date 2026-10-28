using MediatR;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Commands.Documents.UploadDocument;

public sealed class UploadDocumentCommandHandler : IRequestHandler<UploadDocumentCommand, Guid>
{
    private readonly IDocumentsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UploadDocumentCommandHandler(IDocumentsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(UploadDocumentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUser.OrganizationId;

        var document = Document.Create(
            request.FileName,
            request.ContentType,
            request.FileSizeBytes,
            tenantId,
            request.FolderId,
            request.DisplayName,
            request.Description,
            request.Category,
            request.Tags,
            request.LinkedEntityId,
            request.LinkedEntityType);

        var version = DocumentVersion.Create(
            document.Id,
            1,
            request.StorageUrl,
            request.FileSizeBytes,
            request.ContentType,
            _currentUser.UserId,
            _currentUser.FullName,
            tenantId);

        _db.Documents.Add(document);
        _db.DocumentVersions.Add(version);
        await _db.SaveChangesAsync(cancellationToken);

        return document.Id;
    }
}
