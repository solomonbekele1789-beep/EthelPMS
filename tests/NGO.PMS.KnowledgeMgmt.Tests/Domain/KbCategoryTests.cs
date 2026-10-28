using FluentAssertions;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;

namespace NGO.PMS.KnowledgeMgmt.Tests.Domain;

public class KbCategoryTests
{
    [Fact]
    public void Should_Create_Category_With_Valid_Data()
    {
        var orgId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

        var category = KbCategory.Create(
            organizationId: orgId,
            name: "Best Practices",
            description: "Collection of best practices",
            parentCategoryId: parentId,
            sortOrder: 1);

        category.Should().NotBeNull();
        category.Id.Should().NotBeEmpty();
        category.OrganizationId.Should().Be(orgId);
        category.Name.Should().Be("Best Practices");
        category.Description.Should().Be("Collection of best practices");
        category.ParentCategoryId.Should().Be(parentId);
        category.SortOrder.Should().Be(1);
        category.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Should_Track_ParentCategory_Hierarchy()
    {
        var rootCategory = KbCategory.Create(
            Guid.NewGuid(), "Root", "Root category", null, 0);

        var childCategory = KbCategory.Create(
            rootCategory.OrganizationId, "Child", "Child category",
            rootCategory.Id, 1);

        rootCategory.ParentCategoryId.Should().BeNull();
        childCategory.ParentCategoryId.Should().Be(rootCategory.Id);
    }

    [Fact]
    public void Should_Track_IsActive()
    {
        var category = KbCategory.Create(
            Guid.NewGuid(), "Active Category", null, null, 0);

        category.IsActive.Should().BeTrue();

        category.Update("Active Category", null, 0, false);

        category.IsActive.Should().BeFalse();
    }
}
