using MediatR;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Commands.CreateApprovalConfig;

public class CreateApprovalConfigCommandHandler : IRequestHandler<CreateApprovalConfigCommand, Guid>
{
    private readonly ISettingsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateApprovalConfigCommandHandler(ISettingsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateApprovalConfigCommand request, CancellationToken cancellationToken)
    {
        var config = ApprovalConfig.Create(
            _currentUser.OrganizationId,
            request.Module,
            request.EntityType,
            request.RequiredApprovalLevels,
            request.AutoApproveBelow,
            request.IsActive);

        _db.ApprovalConfigs.Add(config);
        await _db.SaveChangesAsync(cancellationToken);

        return config.Id;
    }
}
