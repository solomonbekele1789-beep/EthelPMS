namespace NGO.PMS.Identity.Application;

public interface IEmailService
{
    Task SendPasswordSetupEmailAsync(string email, string firstName, string token, CancellationToken ct = default);
    Task SendPasswordResetEmailAsync(string email, string firstName, string token, CancellationToken ct = default);
    Task SendWelcomeEmailAsync(string email, string firstName, string organizationName, CancellationToken ct = default);
}
