using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.BidEvaluations.EvaluateBid;

public sealed class EvaluateBidCommandHandler : IRequestHandler<EvaluateBidCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public EvaluateBidCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(EvaluateBidCommand request, CancellationToken ct)
    {
        var evaluation = BidEvaluation.Create(
            request.RfqId,
            request.RfqResponseId,
            request.SupplierId,
            request.TechnicalScore,
            request.FinancialScore,
            request.TechnicalWeight,
            request.FinancialWeight,
            _currentUser.OrganizationId);

        _db.BidEvaluations.Add(evaluation);
        await _db.SaveChangesAsync(ct);
        return evaluation.Id;
    }
}
