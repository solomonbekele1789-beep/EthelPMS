using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.RejectMealPlan;

public class RejectMealPlanCommandHandler : IRequestHandler<RejectMealPlanCommand>
{
    private readonly IMealDbContext _db;

    public RejectMealPlanCommandHandler(IMealDbContext db) => _db = db;

    public async Task Handle(RejectMealPlanCommand request, CancellationToken ct)
    {
        var plan = await _db.MealPlans
            .FirstOrDefaultAsync(p => p.Id == request.MealPlanId, ct)
            ?? throw new NotFoundException("MealPlan", request.MealPlanId);

        plan.Reject(request.Reason);
        await _db.SaveChangesAsync(ct);
    }
}
