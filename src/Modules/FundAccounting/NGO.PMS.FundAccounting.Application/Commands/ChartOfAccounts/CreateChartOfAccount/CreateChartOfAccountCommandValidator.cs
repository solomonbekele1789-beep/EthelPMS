using FluentValidation;

namespace NGO.PMS.FundAccounting.Application.Commands.ChartOfAccounts.CreateChartOfAccount;

public sealed class CreateChartOfAccountCommandValidator
    : AbstractValidator<CreateChartOfAccountCommand>
{
    public CreateChartOfAccountCommandValidator()
    {
        RuleFor(x => x.AccountCode)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.AccountName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.AccountCategoryId)
            .NotEmpty();
    }
}
