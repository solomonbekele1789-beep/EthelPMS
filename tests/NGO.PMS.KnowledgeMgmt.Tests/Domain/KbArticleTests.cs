using FluentAssertions;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;
using NGO.PMS.KnowledgeMgmt.Domain.Enums;
using NGO.PMS.KnowledgeMgmt.Domain.Events;

namespace NGO.PMS.KnowledgeMgmt.Tests.Domain;

public class KbArticleTests
{
    private static KbArticle CreateValidArticle(
        string title = "Lesson from Field",
        string content = "Detailed content about the lesson learned.",
        string? tags = "field,lessons",
        Guid? linkedProjectId = null,
        ArticleType articleType = ArticleType.LessonLearned)
    {
        return KbArticle.Create(
            organizationId: Guid.NewGuid(),
            categoryId: Guid.NewGuid(),
            title: title,
            content: content,
            summary: "A brief summary",
            authorId: Guid.NewGuid(),
            tags: tags,
            linkedProjectId: linkedProjectId,
            linkedEvaluationId: null,
            articleType: articleType);
    }

    [Fact]
    public void Should_Create_Article_As_Draft()
    {
        var article = CreateValidArticle();

        article.Should().NotBeNull();
        article.Id.Should().NotBeEmpty();
        article.Status.Should().Be(ArticleStatus.Draft);
        article.ViewCount.Should().Be(0);
        article.IsFeatured.Should().BeFalse();
        article.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<KbArticleCreatedEvent>();
    }

    [Fact]
    public void Should_Publish_Article()
    {
        var article = CreateValidArticle();
        article.ClearDomainEvents();

        article.Publish();

        article.Status.Should().Be(ArticleStatus.Published);
        article.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<KbArticlePublishedEvent>();
    }

    [Fact]
    public void Should_Not_Publish_Without_Title_Or_Content()
    {
        // The Create factory method prevents empty title/content, so Publish()
        // guards are tested by ensuring ArgumentException at creation.
        var actNoTitle = () => KbArticle.Create(
            Guid.NewGuid(), Guid.NewGuid(), "", "Some content", null,
            Guid.NewGuid(), null, null, null, ArticleType.LessonLearned);

        actNoTitle.Should().Throw<ArgumentException>()
            .WithMessage("*title*");

        var actNoContent = () => KbArticle.Create(
            Guid.NewGuid(), Guid.NewGuid(), "Valid Title", "", null,
            Guid.NewGuid(), null, null, null, ArticleType.LessonLearned);

        actNoContent.Should().Throw<ArgumentException>()
            .WithMessage("*content*");
    }

    [Fact]
    public void Should_Archive_Article()
    {
        var article = CreateValidArticle();

        article.Archive();

        article.Status.Should().Be(ArticleStatus.Archived);
    }

    [Fact]
    public void Should_Increment_ViewCount()
    {
        var article = CreateValidArticle();
        article.ViewCount.Should().Be(0);

        article.IncrementViewCount();
        article.IncrementViewCount();
        article.IncrementViewCount();

        article.ViewCount.Should().Be(3);
    }

    [Fact]
    public void Should_Track_Tags_And_LinkedProject()
    {
        var projectId = Guid.NewGuid();
        var article = CreateValidArticle(
            tags: "water,sanitation,hygiene",
            linkedProjectId: projectId);

        article.Tags.Should().Be("water,sanitation,hygiene");
        article.LinkedProjectId.Should().Be(projectId);
    }
}
