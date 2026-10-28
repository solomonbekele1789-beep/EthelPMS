using FluentValidation;

namespace NGO.PMS.FundAccounting.Application.Commands.FundCodes.CreateFundCode;

public sealed class CreateFundCodeCommandValidator
    : AbstractValidator<CreateFundCodeCommand>
{
    public CreateFundCodeCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}
