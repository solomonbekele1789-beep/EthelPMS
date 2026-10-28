using MediatR;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.CreateCategory;

public sealed class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateCategoryCommandHandler(IKnowledgeMgmtDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var category = KbCategory.Create(
            _currentUser.OrganizationId,
            request.Name,
            request.Description,
            request.ParentCategoryId,
            request.SortOrder);

        _db.KbCategories.Add(category);
        await _db.SaveChangesAsync(ct);
        return category.Id;
    }
}
