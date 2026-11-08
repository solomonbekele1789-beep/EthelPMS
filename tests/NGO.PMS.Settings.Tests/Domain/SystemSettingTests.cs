using FluentAssertions;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Tests.Domain;

public class SystemSettingTests
{
    [Fact]
    public void Should_Create_SystemSetting()
    {
        var setting = SystemSetting.Create(
            "app.max-upload-size", "52428800", SettingDataType.Integer,
            "Storage", "Maximum file upload size in bytes");

        setting.Should().NotBeNull();
        setting.Id.Should().NotBeEmpty();
        setting.SettingKey.Should().Be("app.max-upload-size");
        setting.SettingValue.Should().Be("52428800");
        setting.DataType.Should().Be(SettingDataType.Integer);
        setting.Category.Should().Be("Storage");
        setting.Description.Should().Be("Maximum file upload size in bytes");
        setting.IsReadOnly.Should().BeFalse();
    }

    [Fact]
    public void Should_Update_Setting_Value()
    {
        var setting = SystemSetting.Create(
            "app.session-timeout", "30", SettingDataType.Integer,
            "Security", "Session timeout in minutes");

        setting.Update("60");

        setting.SettingValue.Should().Be("60");
    }

    [Fact]
    public void Should_Validate_DataType_On_Update()
    {
        var intSetting = SystemSetting.Create(
            "app.max-retries", "3", SettingDataType.Integer,
            "General", "Max retries");

        var act = () => intSetting.Update("not-a-number");

        act.Should().Throw<ArgumentException>();

        var boolSetting = SystemSetting.Create(
            "app.enable-logging", "true", SettingDataType.Boolean,
            "General", "Enable logging");

        var actBool = () => boolSetting.Update("not-a-bool");

        actBool.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Should_Track_IsReadOnly()
    {
        var readOnlySetting = SystemSetting.Create(
            "app.version", "1.0.0", SettingDataType.String,
            "System", "Application version", isReadOnly: true);

        readOnlySetting.IsReadOnly.Should().BeTrue();

        var act = () => readOnlySetting.Update("2.0.0");

        act.Should().Throw<InvalidOperationException>();

        var editableSetting = SystemSetting.Create(
            "app.name", "EthelPMS", SettingDataType.String,
            "System", "Application name", isReadOnly: false);

        editableSetting.IsReadOnly.Should().BeFalse();
        editableSetting.Update("EthelPMS v2");
        editableSetting.SettingValue.Should().Be("EthelPMS v2");
    }
}
