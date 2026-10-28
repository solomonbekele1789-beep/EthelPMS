using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using NGO.PMS.Identity.Application;

namespace NGO.PMS.Identity.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendPasswordSetupEmailAsync(string email, string firstName, string token, CancellationToken ct = default)
    {
        var baseUrl = _config["App:FrontendUrl"] ?? "http://localhost:4200";
        var link = $"{baseUrl}/auth/setup-password?token={Uri.EscapeDataString(token)}";
        var subject = "Welcome to EthelPMS — Set Up Your Password";
        var body = $"""
            <h2>Welcome, {firstName}!</h2>
            <p>You've been invited to EthelPMS. Click below to set your password:</p>
            <a href="{link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
                Set Up Password
            </a>
            <p style="margin-top:16px;color:#6b7280;font-size:14px;">This link expires in 48 hours.</p>
            """;
        await SendAsync(email, subject, body, ct);
    }

    public async Task SendPasswordResetEmailAsync(string email, string firstName, string token, CancellationToken ct = default)
    {
        var baseUrl = _config["App:FrontendUrl"] ?? "http://localhost:4200";
        var link = $"{baseUrl}/auth/reset-password?token={Uri.EscapeDataString(token)}";
        var subject = "EthelPMS — Reset Your Password";
        var body = $"""
            <h2>Hi {firstName},</h2>
            <p>We received a request to reset your password. Click below to proceed:</p>
            <a href="{link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
                Reset Password
            </a>
            <p style="margin-top:16px;color:#6b7280;font-size:14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            """;
        await SendAsync(email, subject, body, ct);
    }

    public async Task SendWelcomeEmailAsync(string email, string firstName, string organizationName, CancellationToken ct = default)
    {
        var baseUrl = _config["App:FrontendUrl"] ?? "http://localhost:4200";
        var subject = $"Welcome to {organizationName} on EthelPMS";
        var body = $"""
            <h2>Welcome, {firstName}!</h2>
            <p>Your account is now active on <strong>{organizationName}</strong>.</p>
            <a href="{baseUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
                Go to EthelPMS
            </a>
            """;
        await SendAsync(email, subject, body, ct);
    }

    private async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct)
    {
        var smtpHost = _config["EmailSettings:SmtpHost"];
        var smtpPort = _config["EmailSettings:SmtpPort"];
        var username = _config["EmailSettings:Username"];
        var password = _config["EmailSettings:Password"];
        var fromEmail = _config["EmailSettings:FromEmail"] ?? "noreply@ethelpms.com";
        var fromName = _config["EmailSettings:FromName"] ?? "EthelPMS";

        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogWarning("SMTP not configured — email to {To} with subject '{Subject}' was not sent", to, subject);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(smtpHost, int.Parse(smtpPort ?? "587"), SecureSocketOptions.StartTls, ct);

        if (!string.IsNullOrEmpty(username))
            await smtp.AuthenticateAsync(username, password, ct);

        await smtp.SendAsync(message, ct);
        await smtp.DisconnectAsync(true, ct);

        _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
    }
}
