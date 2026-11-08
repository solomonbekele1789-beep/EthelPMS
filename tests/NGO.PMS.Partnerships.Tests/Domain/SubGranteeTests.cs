using FluentAssertions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.Partnerships.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Tests.Domain;

public class SubGranteeTests
{
    private static SubGrantee CreateValidSubGrantee(
        string name = "Local NGO Partner",
        PartnerType partnerType = PartnerType.LocalNGO)
    {
        return SubGrantee.Create(
            organizationId: Guid.NewGuid(),
            name: name,
            contactPerson: "Jane Doe",
            contactEmail: "jane@localngo.org",
            contactPhone: "+251-911-123456",
            country: "Ethiopia",
            partnerType: partnerType,
            registrationNumber: "NGO-2024-001",
            address: "Addis Ababa, Ethiopia");
    }

    [Fact]
    public void Should_Create_SubGrantee_As_Prospect()
    {
        var subGrantee = CreateValidSubGrantee();

        subGrantee.Should().NotBeNull();
        subGrantee.Id.Should().NotBeEmpty();
        subGrantee.Name.Should().Be("Local NGO Partner");
        subGrantee.Status.Should().Be(PartnerStatus.Prospect);
        subGrantee.RiskRating.Should().Be(PartnerRiskRating.Medium);
        subGrantee.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<SubGranteeRegisteredEvent>();
    }

    [Fact]
    public void Should_Activate_SubGrantee()
    {
        var subGrantee = CreateValidSubGrantee();

        subGrantee.Activate();

        subGrantee.Status.Should().Be(PartnerStatus.Active);
        subGrantee.OnboardingDate.Should().NotBeNull();
    }

    [Fact]
    public void Should_Suspend_SubGrantee()
    {
        var subGrantee = CreateValidSubGrantee();
        subGrantee.Activate();

        subGrantee.Suspend("Non-compliance with reporting requirements");

        subGrantee.Status.Should().Be(PartnerStatus.Suspended);
        subGrantee.Notes.Should().Be("Non-compliance with reporting requirements");
    }

    [Fact]
    public void Should_Assess_Risk()
    {
        var subGrantee = CreateValidSubGrantee();

        subGrantee.AssessRisk(PartnerRiskRating.High, 65);

        subGrantee.RiskRating.Should().Be(PartnerRiskRating.High);
        subGrantee.CapacityScore.Should().Be(65);
    }

    [Fact]
    public void Should_Track_PartnerType()
    {
        var academic = CreateValidSubGrantee(
            name: "University Research Center",
            partnerType: PartnerType.AcademicInstitution);

        academic.PartnerType.Should().Be(PartnerType.AcademicInstitution);

        var govBody = CreateValidSubGrantee(
            name: "Ministry of Health",
            partnerType: PartnerType.GovernmentBody);

        govBody.PartnerType.Should().Be(PartnerType.GovernmentBody);
    }

    [Fact]
    public void Should_Implement_IMultiTenant()
    {
        var subGrantee = CreateValidSubGrantee();
        var tenantId = Guid.NewGuid();

        subGrantee.Should().BeAssignableTo<IMultiTenant>();
        subGrantee.TenantId = tenantId;
        subGrantee.TenantId.Should().Be(tenantId);
    }
}
