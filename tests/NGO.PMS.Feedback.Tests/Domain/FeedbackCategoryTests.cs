using FluentAssertions;
using NGO.PMS.Feedback.Domain.Entities;
using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Tests.Domain;

public class FeedbackCategoryTests
{
    [Fact]
    public void Create_ValidInput_ReturnsCategory()
    {
        // Arrange & Act
        var category = FeedbackCategory.Create(
            name: "Service Delivery",
            description: "Feedback about service quality",
            defaultType: FeedbackType.Complaint,
            slaResponseDays: 3,
            slaResolutionDays: 14,
            requiresEscalation: false,
            sortOrder: 1);

        // Assert
        category.Should().NotBeNull();
        category.Id.Should().NotBeEmpty();
        category.Name.Should().Be("Service Delivery");
        category.Description.Should().Be("Feedback about service quality");
        category.DefaultType.Should().Be(FeedbackType.Complaint);
        category.SlaResponseDays.Should().Be(3);
        category.SlaResolutionDays.Should().Be(14);
        category.RequiresEscalation.Should().BeFalse();
        category.IsActive.Should().BeTrue();
        category.SortOrder.Should().Be(1);
    }

    [Fact]
    public void Update_ChangesProperties()
    {
        // Arrange
        var category = FeedbackCategory.Create(
            name: "Original",
            description: "Original desc",
            defaultType: FeedbackType.Suggestion,
            slaResponseDays: 5,
            slaResolutionDays: 30,
            requiresEscalation: false,
            sortOrder: 1);

        // Act
        category.Update(
            name: "Updated Category",
            description: "Updated description",
            defaultType: FeedbackType.Complaint,
            slaResponseDays: 2,
            slaResolutionDays: 10,
            requiresEscalation: true,
            sortOrder: 5);

        // Assert
        category.Name.Should().Be("Updated Category");
        category.Description.Should().Be("Updated description");
        category.DefaultType.Should().Be(FeedbackType.Complaint);
        category.SlaResponseDays.Should().Be(2);
        category.SlaResolutionDays.Should().Be(10);
        category.RequiresEscalation.Should().BeTrue();
        category.SortOrder.Should().Be(5);
    }

    [Fact]
    public void Deactivate_SetsInactive()
    {
        // Arrange
        var category = FeedbackCategory.Create(
            name: "To Deactivate",
            description: null,
            defaultType: FeedbackType.Query,
            slaResponseDays: 5,
            slaResolutionDays: 30,
            requiresEscalation: false,
            sortOrder: 1);

        category.IsActive.Should().BeTrue();

        // Act
        category.Deactivate();

        // Assert
        category.IsActive.Should().BeFalse();
    }
}
