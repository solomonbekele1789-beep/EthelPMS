using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.DeleteCategory;

public sealed class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Unit>
{
    private readonly IKnowledgeMgmtDbContext _db;

    public DeleteCategoryCommandHandler(IKnowledgeMgmtDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        var category = await _db.KbCategories.FirstOrDefaultAsync(c => c.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.KbCategory), request.Id);

        var hasArticles = await _db.KbArticles.AnyAsync(a => a.CategoryId == request.Id, ct);
        if (hasArticles)
            throw new InvalidOperationException("Cannot delete a category that contains articles.");

        _db.KbCategories.Remove(category);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
