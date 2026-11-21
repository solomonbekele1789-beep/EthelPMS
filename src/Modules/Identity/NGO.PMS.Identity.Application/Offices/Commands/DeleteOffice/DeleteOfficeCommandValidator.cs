using FluentValidation;

namespace NGO.PMS.Identity.Application.Offices.Commands.DeleteOffice;

public class DeleteOfficeCommandValidator : AbstractValidator<DeleteOfficeCommand>
{
    public DeleteOfficeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
