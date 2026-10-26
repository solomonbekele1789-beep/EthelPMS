using MediatR;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Application.Gesi.Commands.CreateGesiAssessment;

public class CreateGesiAssessmentCommandHandler : IRequestHandler<CreateGesiAssessmentCommand, Guid>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateGesiAssessmentCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateGesiAssessmentCommand request, CancellationToken ct)
    {
        var assessment = GesiAssessment.Create(
            request.ProjectId, request.GenderMarkerScore,
            request.AssessmentDate, _currentUser.OrganizationId,
            request.Analysis, request.Justification);

        _db.GesiAssessments.Add(assessment);
        await _db.SaveChangesAsync(ct);
        return assessment.Id;
    }
}
