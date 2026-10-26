using FluentValidation;

namespace NGO.PMS.Dashboards.Application.Commands.CreateDashboard;

public class CreateDashboardCommandValidator : AbstractValidator<CreateDashboardCommand>
{
    public CreateDashboardCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DashboardType).IsInEnum();
    }
}
