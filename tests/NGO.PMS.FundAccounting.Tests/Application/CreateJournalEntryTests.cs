using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.FundAccounting.Application.Commands.JournalEntries.CreateJournalEntry;
using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.FundAccounting.Tests.Helpers;

namespace NGO.PMS.FundAccounting.Tests.Application;

public class CreateJournalEntryTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesAndReturnsId()
    {
        var orgId = Guid.NewGuid();
        using var db = FundAccountingTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = FundAccountingTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateJournalEntryCommandHandler(db, currentUser);
        var command = new CreateJournalEntryCommand(
            ReferenceNumber: "JE-001",
            Description: "Test journal entry",
            TransactionDate: DateTime.UtcNow,
            ProjectId: null,
            FundCodeId: null,
            Memo: null,
            Lines: new List<JournalLineInput>
            {
                new(Guid.NewGuid(), 500m, 0m, "Debit line", null),
                new(Guid.NewGuid(), 0m, 500m, "Credit line", null)
            });

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.JournalEntries.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.ReferenceNumber.Should().Be("JE-001");
        saved.Description.Should().Be("Test journal entry");
        saved.Status.Should().Be(JournalEntryStatus.Draft);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validate_EmptyDescription_HasError()
    {
        var validator = new CreateJournalEntryCommandValidator();
        var command = new CreateJournalEntryCommand(
            "JE-001", "", DateTime.UtcNow, null, null, null,
            new List<JournalLineInput>
            {
                new(Guid.NewGuid(), 100m, 0m, null, null),
                new(Guid.NewGuid(), 0m, 100m, null, null)
            });

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Description);
    }

    [Fact]
    public void Validate_EmptyReferenceNumber_HasError()
    {
        var validator = new CreateJournalEntryCommandValidator();
        var command = new CreateJournalEntryCommand(
            "", "Test description", DateTime.UtcNow, null, null, null,
            new List<JournalLineInput>
            {
                new(Guid.NewGuid(), 100m, 0m, null, null),
                new(Guid.NewGuid(), 0m, 100m, null, null)
            });

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ReferenceNumber);
    }
}
