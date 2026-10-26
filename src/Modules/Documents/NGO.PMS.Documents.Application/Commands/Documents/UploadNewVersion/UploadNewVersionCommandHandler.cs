using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Commands.Documents.UploadNewVersion;

public sealed class UploadNewVersionCommandHandler : IRequestHandler<UploadNewVersionCommand, Guid>
{
    private readonly IDocumentsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UploadNewVersionCommandHandler(IDocumentsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(UploadNewVersionCommand request, CancellationToken cancellationToken)
    {
        var document = await _db.Documents
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken)
            ?? throw new InvalidOperationException($"Document {request.DocumentId} not found.");

        document.IncrementVersion(request.FileSizeBytes, request.ContentType);

        var tenantId = _currentUser.OrganizationId;

        var version = DocumentVersion.Create(
            document.Id,
            document.CurrentVersion,
            request.StorageUrl,
            request.FileSizeBytes,
            request.ContentType,
            _currentUser.UserId,
            _currentUser.FullName,
            tenantId,
            request.ChangeNotes);

        _db.DocumentVersions.Add(version);
        await _db.SaveChangesAsync(cancellationToken);

        return version.Id;
    }
}
