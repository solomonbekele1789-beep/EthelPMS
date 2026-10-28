using FluentAssertions;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.Settings.Domain.Enums;
using NGO.PMS.Settings.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Tests.Domain;

public class OrgSettingTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    private OrgSetting CreateOrgSetting(
        string key = "org.fiscal-year-start",
        string value = "January",
        SettingDataType dataType = SettingDataType.String)
        => OrgSetting.Create(_orgId, key, value, dataType, "Finance", "General");

    [Fact]
    public void Should_Create_OrgSetting_With_Valid_Data()
    {
        var setting = OrgSetting.Create(
            _orgId, "org.currency", "USD", SettingDataType.String,
            "Finance", "General", "Default organization currency");

        setting.Should().NotBeNull();
        setting.Id.Should().NotBeEmpty();
        setting.OrganizationId.Should().Be(_orgId);
        setting.SettingKey.Should().Be("org.currency");
        setting.SettingValue.Should().Be("USD");
        setting.DataType.Should().Be(SettingDataType.String);
        setting.Module.Should().Be("Finance");
        setting.Category.Should().Be("General");
        setting.Description.Should().Be("Default organization currency");
    }

    [Fact]
    public void Should_Update_And_Raise_Event()
    {
        var setting = CreateOrgSetting();
        setting.ClearDomainEvents();

        setting.Update("July", SettingDataType.String);

        setting.SettingValue.Should().Be("July");
        setting.DataType.Should().Be(SettingDataType.String);
        setting.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<OrgSettingChangedEvent>()
            .Which.OrganizationId.Should().Be(_orgId);

        var evt = (OrgSettingChangedEvent)setting.DomainEvents.Single();
        evt.OrgSettingId.Should().Be(setting.Id);
        evt.SettingKey.Should().Be("org.fiscal-year-start");
    }

    [Fact]
    public void Should_Track_Module()
    {
        var financeSetting = OrgSetting.Create(
            _orgId, "finance.tax-rate", "15", SettingDataType.Decimal,
            "Finance", "Tax");

        var projectSetting = OrgSetting.Create(
            _orgId, "projects.default-duration", "12", SettingDataType.Integer,
            "Projects", "Defaults");

        financeSetting.Module.Should().Be("Finance");
        projectSetting.Module.Should().Be("Projects");
    }

    [Fact]
    public void Should_Implement_IMultiTenant()
    {
        var setting = CreateOrgSetting();

        setting.Should().BeAssignableTo<IMultiTenant>();
        setting.OrganizationId.Should().Be(_orgId);

        // ISoftDeletable contract
        setting.Should().BeAssignableTo<ISoftDeletable>();
        setting.IsDeleted.Should().BeFalse();
        setting.DeletedAt.Should().BeNull();
    }
}
