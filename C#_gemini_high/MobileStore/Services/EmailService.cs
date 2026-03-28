namespace MobileStore.Services;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(string toEmail, string subject, string message);
}

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendOrderConfirmationAsync(string toEmail, string subject, string message)
    {
        // Mock sending email
        _logger.LogInformation("\n========== MOCK EMAIL SENT ==========\nTo: {Email}\nSubject: {Subject}\nMessage:\n{Message}\n=====================================", toEmail, subject, message);
        return Task.CompletedTask;
    }
}
