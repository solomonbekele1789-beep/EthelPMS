using FluentAssertions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.Procurement.Domain.Enums;

namespace NGO.PMS.Procurement.Tests.Domain;

public class SupplierTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    private Supplier CreateActiveSupplier()
        => Supplier.Create("Acme", "John", "john@acme.com", _orgId);

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var supplier = CreateActiveSupplier();

        supplier.Name.Should().Be("Acme");
        supplier.ContactPerson.Should().Be("John");
        supplier.Email.Should().Be("john@acme.com");
        supplier.Status.Should().Be(SupplierStatus.Active);
        supplier.Rating.Should().Be(0);
        supplier.OrganizationId.Should().Be(_orgId);
    }

    [Fact]
    public void Rate_ValidScore_UpdatesRating()
    {
        var supplier = CreateActiveSupplier();

        supplier.Rate(4.5m);

        supplier.Rating.Should().Be(4.5m);
    }

    [Fact]
    public void Rate_InvalidScore_ThrowsArgumentException()
    {
        var supplier = CreateActiveSupplier();

        var act = () => supplier.Rate(6m);

        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void Blacklist_SetsStatusAndReason()
    {
        var supplier = CreateActiveSupplier();

        supplier.Blacklist("fraud");

        supplier.Status.Should().Be(SupplierStatus.Blacklisted);
        supplier.BlacklistReason.Should().Be("fraud");
    }

    [Fact]
    public void Blacklist_AlreadyBlacklisted_ThrowsInvalidOperationException()
    {
        var supplier = CreateActiveSupplier();
        supplier.Blacklist("fraud");

        var act = () => supplier.Blacklist("duplicate fraud");

        act.Should().Throw<InvalidOperationException>();
    }
}
