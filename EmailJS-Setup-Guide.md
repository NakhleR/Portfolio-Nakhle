# EmailJS Setup Guide for Your Contact Form

I've integrated EmailJS into your contact form to enable email functionality. Follow these steps to complete the setup:

## 1. Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account
2. Verify your email address

## 2. Create an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Give your service a name (e.g., "portfolio-contact")

## 3. Create an Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Design your email template with the following variables:
   - `{{from_name}}` - The name from the contact form
   - `{{from_email}}` - The email address from the contact form
   - `{{message}}` - The message from the contact form
4. Save your template

## 4. Update Your Contact Form Code

In your `Contact.tsx` file, replace the placeholder values with your actual EmailJS credentials:

```javascript
// Replace these with your actual EmailJS service ID, template ID, and public key
const serviceId = "YOUR_SERVICE_ID"; // The ID of the service you created
const templateId = "YOUR_TEMPLATE_ID"; // The ID of the template you created
const publicKey = "YOUR_PUBLIC_KEY"; // Your EmailJS public key (found in Account > API Keys)
```

## 5. Test Your Form

After updating the credentials, test your contact form by submitting a test message. You should receive the email at the address associated with your EmailJS service.

## Notes

- The free tier of EmailJS allows 200 emails per month
- The form includes loading states and error handling
- The success message will display for 5 seconds after a successful submission

If you encounter any issues, check the browser console for error messages and verify your EmailJS credentials.
