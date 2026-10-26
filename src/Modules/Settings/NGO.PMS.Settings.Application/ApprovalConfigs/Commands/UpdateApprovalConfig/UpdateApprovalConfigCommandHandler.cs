using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Commands.UpdateApprovalConfig;

public class UpdateApprovalConfigCommandHandler : IRequestHandler<UpdateApprovalConfigCommand>
{
    private readonly ISettingsDbContext _db;

    public UpdateApprovalConfigCommandHandler(ISettingsDbContext db)
    {
        _db = db;
    }

    public async Task Handle(UpdateApprovalConfigCommand request, CancellationToken cancellationToken)
    {
        var config = await _db.ApprovalConfigs
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("ApprovalConfig", request.Id);

        config.Update(request.RequiredApprovalLevels, request.AutoApproveBelow, request.IsActive);

        await _db.SaveChangesAsync(cancellationToken);
    }
}
