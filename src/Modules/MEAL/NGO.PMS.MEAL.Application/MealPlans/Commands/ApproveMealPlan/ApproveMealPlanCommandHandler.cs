using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.ApproveMealPlan;

public class ApproveMealPlanCommandHandler : IRequestHandler<ApproveMealPlanCommand>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApproveMealPlanCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(ApproveMealPlanCommand request, CancellationToken ct)
    {
        var plan = await _db.MealPlans
            .FirstOrDefaultAsync(p => p.Id == request.MealPlanId, ct)
            ?? throw new NotFoundException("MealPlan", request.MealPlanId);

        plan.Approve(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);
    }
}
