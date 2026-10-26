using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Procurement.Application.Commands.Suppliers.CreateSupplier;
using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.Procurement.Tests.Helpers;

namespace NGO.PMS.Procurement.Tests.Application;

public class CreateSupplierTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesAndReturnsId()
    {
        var orgId = Guid.NewGuid();
        using var db = ProcurementTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ProcurementTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateSupplierCommandHandler(db, currentUser);
        var command = new CreateSupplierCommand(
            Name: "Acme Corp",
            ContactPerson: "Jane Doe",
            Email: "jane@acme.com",
            Phone: "+251911000000",
            Address: "Addis Ababa",
            TaxIdNumber: "TAX-123");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Suppliers.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Acme Corp");
        saved.Status.Should().Be(SupplierStatus.Active);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validate_EmptyName_HasError()
    {
        var validator = new CreateSupplierCommandValidator();
        var command = new CreateSupplierCommand("", "Jane", "jane@acme.com", null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_EmptyEmail_HasError()
    {
        var validator = new CreateSupplierCommandValidator();
        var command = new CreateSupplierCommand("Acme", "Jane", "", null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }
}
