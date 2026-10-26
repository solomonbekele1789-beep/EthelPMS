using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Dashboards.Application.Commands.DeleteSavedFilter;

public sealed class DeleteSavedFilterCommandHandler : IRequestHandler<DeleteSavedFilterCommand, Unit>
{
    private readonly IDashboardsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteSavedFilterCommandHandler(IDashboardsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(DeleteSavedFilterCommand request, CancellationToken cancellationToken)
    {
        var filter = await _db.SavedFilters
            .FirstOrDefaultAsync(f => f.Id == request.Id && f.UserId == _currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("SavedFilter", request.Id);

        _db.SavedFilters.Remove(filter);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
