using FluentValidation;

namespace NGO.PMS.Projects.Application.Projects.Commands.RejectProject;

public class RejectProjectCommandValidator : AbstractValidator<RejectProjectCommand>
{
    public RejectProjectCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(2000);
    }
}
