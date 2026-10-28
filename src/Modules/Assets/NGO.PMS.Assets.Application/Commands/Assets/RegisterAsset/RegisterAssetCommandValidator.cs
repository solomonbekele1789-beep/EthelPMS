using FluentValidation;

namespace NGO.PMS.Assets.Application.Commands.Assets.RegisterAsset;

public sealed class RegisterAssetCommandValidator : AbstractValidator<RegisterAssetCommand>
{
    public RegisterAssetCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AssetCategoryId).NotEmpty();
        RuleFor(x => x.Location).NotEmpty().MaximumLength(300);
        RuleFor(x => x.PurchaseCost).GreaterThan(0);
        RuleFor(x => x.UsefulLifeYears).GreaterThan(0);
        RuleFor(x => x.DepreciationMethod).IsInEnum();
    }
}
