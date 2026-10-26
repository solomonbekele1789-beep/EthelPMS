using FluentValidation;

namespace NGO.PMS.FundAccounting.Application.Commands.JournalEntries.CreateJournalEntry;

public sealed class CreateJournalEntryCommandValidator
    : AbstractValidator<CreateJournalEntryCommand>
{
    public CreateJournalEntryCommandValidator()
    {
        RuleFor(x => x.ReferenceNumber)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(x => x.Lines)
            .NotEmpty()
            .WithMessage("At least one journal line is required.");

        RuleFor(x => x.Lines)
            .Must(lines => lines != null
                && lines.Sum(l => l.DebitAmount) == lines.Sum(l => l.CreditAmount))
            .WithMessage("Total debits must equal total credits.");

        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.AccountId).NotEmpty();
        });
    }
}
