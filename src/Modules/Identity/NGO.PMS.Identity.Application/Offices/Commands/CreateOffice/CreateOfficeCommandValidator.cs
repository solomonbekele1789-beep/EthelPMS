using FluentValidation;

namespace NGO.PMS.Identity.Application.Offices.Commands.CreateOffice;

public class CreateOfficeCommandValidator : AbstractValidator<CreateOfficeCommand>
{
    public CreateOfficeCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.OfficeType).NotEmpty().Must(t => t == "HeadOffice" || t == "AreaOffice" || t == "BranchOffice")
            .WithMessage("OfficeType must be 'HeadOffice', 'AreaOffice', or 'BranchOffice'.");
    }
}
