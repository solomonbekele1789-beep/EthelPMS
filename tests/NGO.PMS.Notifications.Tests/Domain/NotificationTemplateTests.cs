using FluentAssertions;
using NGO.PMS.Notifications.Domain.Entities;
using NGO.PMS.Notifications.Domain.Enums;

namespace NGO.PMS.Notifications.Tests.Domain;

public class NotificationTemplateTests
{
    [Fact]
    public void Create_ValidInput_ReturnsTemplate()
    {
        var template = NotificationTemplate.Create(
            "project.created",
            "Project Created: {{ProjectName}}",
            "A new project '{{ProjectName}}' has been created.",
            NotificationChannel.Email,
            titleTemplateAm: null,
            bodyTemplateAm: null);

        template.Should().NotBeNull();
        template.Id.Should().NotBeEmpty();
        template.EventType.Should().Be("project.created");
        template.TitleTemplateEn.Should().Be("Project Created: {{ProjectName}}");
        template.BodyTemplateEn.Should().Be("A new project '{{ProjectName}}' has been created.");
        template.DefaultChannel.Should().Be(NotificationChannel.Email);
        template.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Update_ChangesProperties()
    {
        var template = NotificationTemplate.Create(
            "task.assigned",
            "Original Title",
            "Original Body",
            NotificationChannel.InApp);

        template.Update(
            "Updated Title Template",
            "Updated Body Template",
            NotificationChannel.Push,
            titleTemplateAm: "Updated Am Title",
            bodyTemplateAm: "Updated Am Body");

        template.TitleTemplateEn.Should().Be("Updated Title Template");
        template.BodyTemplateEn.Should().Be("Updated Body Template");
        template.DefaultChannel.Should().Be(NotificationChannel.Push);
        template.TitleTemplateAm.Should().Be("Updated Am Title");
        template.BodyTemplateAm.Should().Be("Updated Am Body");
    }

    [Fact]
    public void Deactivate_SetsInactive()
    {
        var template = NotificationTemplate.Create(
            "report.ready",
            "Report Ready",
            "Your report is ready for download.",
            NotificationChannel.InApp);

        template.IsActive.Should().BeTrue();

        template.Deactivate();

        template.IsActive.Should().BeFalse();
    }
}
