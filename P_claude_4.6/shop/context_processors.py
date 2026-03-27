from shop.cart import Cart


def cart_context(request):
    """Make cart available in all templates."""
    return {'cart': Cart(request)}
