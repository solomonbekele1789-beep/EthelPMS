using FluentValidation;

namespace NGO.PMS.Participants.Application.Graduation.Commands.CreateBenchmark;

public class CreateBenchmarkCommandValidator : AbstractValidator<CreateBenchmarkCommand>
{
    public CreateBenchmarkCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Domain).NotEmpty().MaximumLength(100);
    }
}
