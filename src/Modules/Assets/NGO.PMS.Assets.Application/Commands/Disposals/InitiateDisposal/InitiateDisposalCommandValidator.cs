using FluentValidation;

namespace NGO.PMS.Assets.Application.Commands.Disposals.InitiateDisposal;

public sealed class InitiateDisposalCommandValidator : AbstractValidator<InitiateDisposalCommand>
{
    public InitiateDisposalCommandValidator()
    {
        RuleFor(x => x.AssetId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
        RuleFor(x => x.DisposalMethod).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DonorGrantId)
            .NotEmpty()
            .When(x => x.RequiresDonorApproval)
            .WithMessage("Donor grant ID is required when donor approval is needed.");
    }
}
