using FluentValidation;

namespace NGO.PMS.Documents.Application.Commands.Documents.UploadDocument;

public sealed class UploadDocumentCommandValidator : AbstractValidator<UploadDocumentCommand>
{
    public UploadDocumentCommandValidator()
    {
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ContentType).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FileSizeBytes).GreaterThan(0);
        RuleFor(x => x.StorageUrl).NotEmpty().MaximumLength(1000);
    }
}
