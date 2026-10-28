using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;

namespace NGO.PMS.Documents.Application.Commands.Documents.UpdateDocumentMetadata;

public sealed class UpdateDocumentMetadataCommandHandler : IRequestHandler<UpdateDocumentMetadataCommand, Unit>
{
    private readonly IDocumentsDbContext _db;

    public UpdateDocumentMetadataCommandHandler(IDocumentsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateDocumentMetadataCommand request, CancellationToken cancellationToken)
    {
        var document = await _db.Documents
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken)
            ?? throw new InvalidOperationException($"Document {request.DocumentId} not found.");

        document.UpdateMetadata(
            request.DisplayName,
            request.Description,
            request.Category,
            request.Tags,
            request.LinkedEntityId,
            request.LinkedEntityType);

        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
