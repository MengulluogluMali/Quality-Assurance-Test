using System.Net;
using System.Net.Mail;

namespace MobileShop.Services;

public interface IEmailSender
{
    Task SendEmailAsync(string to, string subject, string htmlBody);
}

public class SmtpSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@mobileshop.com";
    public bool EnableSsl { get; set; } = true;
}

public class EmailSender : IEmailSender
{
    private readonly SmtpSettings _settings;
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(SmtpSettings settings, ILogger<EmailSender> logger)
    {
        _settings = settings;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        // If SMTP credentials are not configured, log instead
        if (string.IsNullOrEmpty(_settings.Username) || string.IsNullOrEmpty(_settings.Password))
        {
            _logger.LogWarning("=== EMAIL NOTIFICATION (SMTP not configured) ===");
            _logger.LogWarning("To: {To}", to);
            _logger.LogWarning("Subject: {Subject}", subject);
            _logger.LogWarning("Body: {Body}", htmlBody);
            _logger.LogWarning("=== Configure SMTP in appsettings.json to send real emails ===");
            return;
        }

        try
        {
            using var client = new SmtpClient(_settings.Host, _settings.Port)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                EnableSsl = _settings.EnableSsl
            };

            var message = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail, "MobileShop"),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(to);

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
        }
    }
}
