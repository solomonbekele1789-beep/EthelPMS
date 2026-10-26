using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.Risk.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Risk.Application.Risks.Commands.RecordRiskAssessment;

public class RecordRiskAssessmentCommandHandler : IRequestHandler<RecordRiskAssessmentCommand, Guid>
{
    private readonly IRiskDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordRiskAssessmentCommandHandler(IRiskDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(RecordRiskAssessmentCommand request, CancellationToken cancellationToken)
    {
        var riskExists = await _db.Risks
            .AnyAsync(r => r.Id == request.RiskId, cancellationToken);

        if (!riskExists)
            throw new NotFoundException("Risk", request.RiskId);

        var assessment = RiskAssessment.Create(
            request.RiskId,
            request.Likelihood,
            request.Impact,
            _currentUser.FullName,
            request.Notes,
            request.Source ?? "Manual");

        _db.RiskAssessments.Add(assessment);
        await _db.SaveChangesAsync(cancellationToken);

        return assessment.Id;
    }
}
