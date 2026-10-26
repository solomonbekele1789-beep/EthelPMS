using MediatR;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Application.Commands.CreateSavedFilter;

public sealed class CreateSavedFilterCommandHandler : IRequestHandler<CreateSavedFilterCommand, Guid>
{
    private readonly IDashboardsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateSavedFilterCommandHandler(IDashboardsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateSavedFilterCommand request, CancellationToken cancellationToken)
    {
        var filter = SavedFilter.Create(
            _currentUser.OrganizationId,
            _currentUser.UserId,
            request.Name,
            request.Module,
            request.FilterJson,
            request.IsDefault);

        _db.SavedFilters.Add(filter);
        await _db.SaveChangesAsync(cancellationToken);

        return filter.Id;
    }
}
