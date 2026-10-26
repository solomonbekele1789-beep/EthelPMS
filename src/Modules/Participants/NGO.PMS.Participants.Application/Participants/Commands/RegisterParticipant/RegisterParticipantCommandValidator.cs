using FluentValidation;

namespace NGO.PMS.Participants.Application.Participants.Commands.RegisterParticipant;

public class RegisterParticipantCommandValidator : AbstractValidator<RegisterParticipantCommand>
{
    public RegisterParticipantCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Gender).IsInEnum();
    }
}
