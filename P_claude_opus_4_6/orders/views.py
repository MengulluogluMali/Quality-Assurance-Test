from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
from shop.cart import Cart
from .models import Order, OrderItem
from .forms import OrderCreateForm


@login_required
def checkout(request):
    cart = Cart(request)
    if len(cart) == 0:
        return redirect('shop:product_list')

    if request.method == 'POST':
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            order = Order(
                user=request.user,
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'],
                email=form.cleaned_data['email'],
                address=form.cleaned_data['address'],
                city=form.cleaned_data['city'],
                phone=form.cleaned_data.get('phone', ''),
            )
            order.save()

            for item in cart:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    price=item['price'],
                    quantity=item['quantity']
                )

            # Clear the cart
            cart.clear()

            # Send email notification to admin
            _send_order_notification(order)

            return redirect('orders:order_complete', order_id=order.id)
    else:
        # Pre-fill form with user data
        initial = {
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email,
        }
        form = OrderCreateForm(initial=initial)

    return render(request, 'orders/checkout.html', {
        'cart': cart,
        'form': form,
    })


@login_required
def order_complete(request, order_id):
    order = Order.objects.get(id=order_id, user=request.user)
    return render(request, 'orders/order_complete.html', {'order': order})


def _send_order_notification(order):
    """Send email notification to admin about new order."""
    items_text = ""
    for item in order.items.all():
        items_text += f"  • {item.product.name} × {item.quantity} — ${item.get_cost()}\n"

    subject = f'🛒 New Order #{order.id} — PhoneGear Store'
    message = f"""
New order received!

Order #{order.id}
Customer: {order.first_name} {order.last_name}
Email: {order.email}
Phone: {order.phone or 'N/A'}
Address: {order.address}, {order.city}

Items ordered:
{items_text}
Total: ${order.get_total_cost()}

View in admin: /admin/orders/order/{order.id}/change/
"""
    try:
        send_mail(
            subject,
            message,
            'noreply@phonegear.com',
            [settings.ADMIN_EMAIL],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[EMAIL ERROR] Could not send notification: {e}")
