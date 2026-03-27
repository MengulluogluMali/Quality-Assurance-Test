from django import forms


class OrderCreateForm(forms.Form):
    first_name = forms.CharField(max_length=50, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'First name'
    }))
    last_name = forms.CharField(max_length=50, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Last name'
    }))
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': 'form-input', 'placeholder': 'Email'
    }))
    address = forms.CharField(max_length=250, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Street address'
    }))
    city = forms.CharField(max_length=100, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'City'
    }))
    phone = forms.CharField(max_length=20, required=False, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Phone number (optional)'
    }))
