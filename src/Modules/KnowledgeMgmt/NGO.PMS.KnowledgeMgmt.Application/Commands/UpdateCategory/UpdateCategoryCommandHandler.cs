using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.UpdateCategory;

public sealed class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Unit>
{
    private readonly IKnowledgeMgmtDbContext _db;

    public UpdateCategoryCommandHandler(IKnowledgeMgmtDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await _db.KbCategories.FirstOrDefaultAsync(c => c.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.KbCategory), request.Id);

        category.Update(request.Name, request.Description, request.SortOrder, request.IsActive);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
