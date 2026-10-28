using MediatR;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.CreateMealPlan;

public class CreateMealPlanCommandHandler : IRequestHandler<CreateMealPlanCommand, Guid>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateMealPlanCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateMealPlanCommand request, CancellationToken ct)
    {
        var plan = MealPlan.Create(
            request.Title, request.ProjectId,
            _currentUser.OrganizationId, request.Description);

        _db.MealPlans.Add(plan);
        await _db.SaveChangesAsync(ct);
        return plan.Id;
    }
}
