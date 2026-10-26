using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.UpdateMealPlanSection;

public class UpdateMealPlanSectionCommandHandler : IRequestHandler<UpdateMealPlanSectionCommand>
{
    private readonly IMealDbContext _db;

    public UpdateMealPlanSectionCommandHandler(IMealDbContext db) => _db = db;

    public async Task Handle(UpdateMealPlanSectionCommand request, CancellationToken ct)
    {
        var plan = await _db.MealPlans
            .FirstOrDefaultAsync(p => p.Id == request.MealPlanId, ct)
            ?? throw new NotFoundException("MealPlan", request.MealPlanId);

        plan.UpdateSection(request.SectionNumber, request.Content);
        await _db.SaveChangesAsync(ct);
    }
}
