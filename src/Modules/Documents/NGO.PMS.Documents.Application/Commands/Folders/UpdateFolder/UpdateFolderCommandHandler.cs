using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;

namespace NGO.PMS.Documents.Application.Commands.Folders.UpdateFolder;

public sealed class UpdateFolderCommandHandler : IRequestHandler<UpdateFolderCommand, Unit>
{
    private readonly IDocumentsDbContext _db;

    public UpdateFolderCommandHandler(IDocumentsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateFolderCommand request, CancellationToken cancellationToken)
    {
        var folder = await _db.DocumentFolders
            .FirstOrDefaultAsync(f => f.Id == request.FolderId, cancellationToken)
            ?? throw new InvalidOperationException($"Folder {request.FolderId} not found.");

        folder.Update(request.Name, request.Description);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
