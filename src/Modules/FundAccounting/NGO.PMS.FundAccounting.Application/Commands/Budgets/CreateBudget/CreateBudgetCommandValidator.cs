using FluentValidation;

namespace NGO.PMS.FundAccounting.Application.Commands.Budgets.CreateBudget;

public sealed class CreateBudgetCommandValidator
    : AbstractValidator<CreateBudgetCommand>
{
    public CreateBudgetCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.ProjectId)
            .NotEmpty();

        RuleFor(x => x.FiscalYear)
            .GreaterThan(0);

        RuleFor(x => x.CurrencyCode)
            .NotEmpty()
            .MaximumLength(3);

        RuleFor(x => x.ExchangeRate)
            .GreaterThan(0);
    }
}
