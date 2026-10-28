using MediatR;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Application.Risks.Commands.CreateRisk;

public class CreateRiskCommandHandler : IRequestHandler<CreateRiskCommand, Guid>
{
    private readonly IRiskDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateRiskCommandHandler(IRiskDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateRiskCommand request, CancellationToken cancellationToken)
    {
        var risk = Domain.Entities.Risk.Create(
            request.ProjectId,
            request.Title,
            request.Description,
            request.Likelihood,
            request.Impact,
            _currentUser.OrganizationId,
            request.RiskCategoryId,
            request.Owner,
            request.OwnerUserId,
            request.Location,
            request.ResidualRiskNotes);

        _db.Risks.Add(risk);
        await _db.SaveChangesAsync(cancellationToken);

        return risk.Id;
    }
}
