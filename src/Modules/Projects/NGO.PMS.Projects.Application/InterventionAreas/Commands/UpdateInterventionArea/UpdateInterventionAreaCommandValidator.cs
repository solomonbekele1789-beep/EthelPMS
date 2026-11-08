using FluentValidation;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.UpdateInterventionArea;

public class UpdateInterventionAreaCommandValidator : AbstractValidator<UpdateInterventionAreaCommand>
{
    public UpdateInterventionAreaCommandValidator()
    {
        RuleFor(x => x.InterventionAreaId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        When(x => x.Latitude.HasValue, () =>
        {
            RuleFor(x => x.Latitude!.Value).InclusiveBetween(-90, 90)
                .WithMessage("Latitude must be between -90 and 90 degrees.");
        });
        When(x => x.Longitude.HasValue, () =>
        {
            RuleFor(x => x.Longitude!.Value).InclusiveBetween(-180, 180)
                .WithMessage("Longitude must be between -180 and 180 degrees.");
        });
    }
}
