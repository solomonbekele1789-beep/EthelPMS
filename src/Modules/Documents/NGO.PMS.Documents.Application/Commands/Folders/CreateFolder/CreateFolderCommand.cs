using MediatR;

namespace NGO.PMS.Documents.Application.Commands.Folders.CreateFolder;

public sealed record CreateFolderCommand(
    string Name,
    Guid? ParentFolderId = null,
    string? Description = null,
    Guid? ProjectId = null,
    int SortOrder = 0) : IRequest<Guid>;
