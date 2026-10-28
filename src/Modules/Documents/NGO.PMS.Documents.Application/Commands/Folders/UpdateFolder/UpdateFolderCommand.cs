using MediatR;

namespace NGO.PMS.Documents.Application.Commands.Folders.UpdateFolder;

public sealed record UpdateFolderCommand(
    Guid FolderId,
    string Name,
    string? Description) : IRequest<Unit>;
