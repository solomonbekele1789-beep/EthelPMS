using MediatR;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.AddMealIndicator;

public class AddMealIndicatorCommandHandler : IRequestHandler<AddMealIndicatorCommand, Guid>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddMealIndicatorCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddMealIndicatorCommand request, CancellationToken ct)
    {
        var indicator = MealIndicator.Create(
            request.MealPlanId, request.Name, request.Level,
            request.CollectionFrequency, _currentUser.OrganizationId,
            request.IndicatorId, request.BaselineValue, request.TargetValue);

        _db.MealIndicators.Add(indicator);
        await _db.SaveChangesAsync(ct);
        return indicator.Id;
    }
}
