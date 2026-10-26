using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;

namespace NGO.PMS.Documents.Application.Commands.Folders.MoveFolder;

public sealed class MoveFolderCommandHandler : IRequestHandler<MoveFolderCommand, Unit>
{
    private readonly IDocumentsDbContext _db;

    public MoveFolderCommandHandler(IDocumentsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(MoveFolderCommand request, CancellationToken cancellationToken)
    {
        var folder = await _db.DocumentFolders
            .FirstOrDefaultAsync(f => f.Id == request.FolderId, cancellationToken)
            ?? throw new InvalidOperationException($"Folder {request.FolderId} not found.");

        folder.MoveTo(request.ParentFolderId);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
