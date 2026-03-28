using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MobileShop.Hubs;

public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // If user is in Admin role, add to Admins group
        if (Context.User?.IsInRole("Admin") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.User?.IsInRole("Admin") == true)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
        }
        await base.OnDisconnectedAsync(exception);
    }
}
