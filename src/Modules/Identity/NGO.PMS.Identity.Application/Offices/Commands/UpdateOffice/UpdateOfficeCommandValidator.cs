using FluentValidation;

namespace NGO.PMS.Identity.Application.Offices.Commands.UpdateOffice;

public class UpdateOfficeCommandValidator : AbstractValidator<UpdateOfficeCommand>
{
    public UpdateOfficeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Type).NotEmpty().MaximumLength(50);
    }
}
