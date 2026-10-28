using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.KnowledgeMgmt.Application.Commands.CreateArticle;
using NGO.PMS.KnowledgeMgmt.Domain.Enums;
using NGO.PMS.KnowledgeMgmt.Tests.Helpers;

namespace NGO.PMS.KnowledgeMgmt.Tests.Application;

public class CreateArticleTests
{
    [Fact]
    public async Task Should_Create_Valid_Article()
    {
        var orgId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        using var db = KnowledgeMgmtTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = KnowledgeMgmtTestFixture.CreateMockCurrentUser(userId: userId, orgId: orgId);

        var handler = new CreateArticleCommandHandler(db, currentUser);
        var command = new CreateArticleCommand(
            CategoryId: Guid.NewGuid(),
            Title: "Water Supply Best Practices",
            Content: "Detailed guidance on community water supply management.",
            Summary: "Best practices for water supply",
            Tags: "water,supply",
            LinkedProjectId: Guid.NewGuid(),
            LinkedEvaluationId: null,
            ArticleType: ArticleType.BestPractice);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.KbArticles.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Water Supply Best Practices");
        saved.Content.Should().Be("Detailed guidance on community water supply management.");
        saved.Status.Should().Be(ArticleStatus.Draft);
        saved.ArticleType.Should().Be(ArticleType.BestPractice);
        saved.Tags.Should().Be("water,supply");
    }

    [Fact]
    public void Should_Fail_Without_Title()
    {
        var validator = new CreateArticleCommandValidator();
        var command = new CreateArticleCommand(
            CategoryId: Guid.NewGuid(),
            Title: "",
            Content: "Some content",
            Summary: null,
            Tags: null,
            LinkedProjectId: null,
            LinkedEvaluationId: null,
            ArticleType: ArticleType.LessonLearned);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_Fail_Without_CategoryId()
    {
        var validator = new CreateArticleCommandValidator();
        var command = new CreateArticleCommand(
            CategoryId: Guid.Empty,
            Title: "Valid Title",
            Content: "Some content",
            Summary: null,
            Tags: null,
            LinkedProjectId: null,
            LinkedEvaluationId: null,
            ArticleType: ArticleType.LessonLearned);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }
}
