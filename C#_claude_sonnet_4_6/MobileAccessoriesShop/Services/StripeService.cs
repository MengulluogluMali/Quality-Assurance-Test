using Stripe;

namespace MobileAccessoriesShop.Services
{
    public class StripeSettings
    {
        public string PublishableKey { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
    }

    public class StripeService
    {
        private readonly StripeSettings _settings;

        public StripeService(StripeSettings settings)
        {
            _settings = settings;
            StripeConfiguration.ApiKey = settings.SecretKey;
        }

        public async Task<PaymentIntent> CreatePaymentIntentAsync(long amountCents, string currency = "usd")
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = amountCents,
                Currency = currency,
                PaymentMethodTypes = new List<string> { "card" },
            };
            var service = new PaymentIntentService();
            return await service.CreateAsync(options);
        }

        public async Task<PaymentIntent?> GetPaymentIntentAsync(string paymentIntentId)
        {
            var service = new PaymentIntentService();
            return await service.GetAsync(paymentIntentId);
        }
    }
}
