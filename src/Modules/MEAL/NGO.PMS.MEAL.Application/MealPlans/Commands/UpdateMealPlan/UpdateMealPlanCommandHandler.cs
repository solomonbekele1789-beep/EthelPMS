using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.UpdateMealPlan;

public class UpdateMealPlanCommandHandler : IRequestHandler<UpdateMealPlanCommand>
{
    private readonly IMealDbContext _db;

    public UpdateMealPlanCommandHandler(IMealDbContext db) => _db = db;

    public async Task Handle(UpdateMealPlanCommand request, CancellationToken ct)
    {
        var plan = await _db.MealPlans
            .FirstOrDefaultAsync(p => p.Id == request.MealPlanId, ct)
            ?? throw new NotFoundException("MealPlan", request.MealPlanId);

        plan.Update(request.Title, request.Description);
        await _db.SaveChangesAsync(ct);
    }
}
