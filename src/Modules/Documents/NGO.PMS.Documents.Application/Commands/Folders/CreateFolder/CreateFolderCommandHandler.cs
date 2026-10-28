using MediatR;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Commands.Folders.CreateFolder;

public sealed class CreateFolderCommandHandler : IRequestHandler<CreateFolderCommand, Guid>
{
    private readonly IDocumentsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateFolderCommandHandler(IDocumentsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateFolderCommand request, CancellationToken cancellationToken)
    {
        var folder = DocumentFolder.Create(
            request.Name,
            _currentUser.OrganizationId,
            request.ParentFolderId,
            request.Description,
            request.ProjectId,
            request.SortOrder);

        _db.DocumentFolders.Add(folder);
        await _db.SaveChangesAsync(cancellationToken);

        return folder.Id;
    }
}
