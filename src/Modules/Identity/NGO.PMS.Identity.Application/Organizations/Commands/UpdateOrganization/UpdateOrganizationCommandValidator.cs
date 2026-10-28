using FluentValidation;

namespace NGO.PMS.Identity.Application.Organizations.Commands.UpdateOrganization;

public class UpdateOrganizationCommandValidator : AbstractValidator<UpdateOrganizationCommand>
{
    public UpdateOrganizationCommandValidator() { RuleFor(x => x.Name).NotEmpty().MaximumLength(200); }
}
