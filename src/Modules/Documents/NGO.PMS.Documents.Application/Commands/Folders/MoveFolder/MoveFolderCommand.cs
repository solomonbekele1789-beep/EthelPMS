using MediatR;

namespace NGO.PMS.Documents.Application.Commands.Folders.MoveFolder;

public sealed record MoveFolderCommand(
    Guid FolderId,
    Guid? ParentFolderId) : IRequest<Unit>;
