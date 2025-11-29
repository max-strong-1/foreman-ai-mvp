# Checkout Form Setup Guide

This guide helps you customize the checkout pre-population to work with your specific form.

## Step 1: Identify Your Form Platform

First, determine what platform your checkout form uses:

### WooCommerce (WordPress)
**How to identify:**
- Look for classes like `woocommerce-checkout`, `woocommerce-billing-fields`
- Form action points to `?wc-ajax=checkout`

**Common field names:**
- `billing_first_name`
- `billing_last_name`
- `billing_email`
- `billing_phone`
- `billing_address_1`
- `billing_city`
- `billing_state`
- `billing_postcode`
- `order_comments`

**Good news:** The pre-population script already includes WooCommerce selectors!

### Shopify
**How to identify:**
- URL contains `checkout.shopify.com`
- Form has classes like `checkout__form`

**Common field names:**
- `checkout[email]`
- `checkout[shipping_address][first_name]`
- `checkout[shipping_address][last_name]`
- `checkout[shipping_address][phone]`
- `checkout[shipping_address][address1]`
- `checkout[shipping_address][city]`
- `checkout[shipping_address][zip]`

### Custom Form
**How to identify:**
- Doesn't match WooCommerce or Shopify patterns
- May have custom field names

**You'll need to find the field names yourself (see Step 2)**

## Step 2: Find Your Form Field Selectors

### Method 1: Browser Inspector (Easiest)

1. Go to your checkout page: https://milestonetrucks.com/checkout/
2. Right-click on the **Email field** → **Inspect Element**
3. Look at the highlighted HTML. You'll see something like:
   ```html
   <input type="email" id="billing_email" name="billing_email">
   ```
4. Write down the `id` and `name` values
5. Repeat for all fields you want to pre-populate

### Method 2: View Page Source

1. Go to checkout page
2. Right-click → **View Page Source** (or Ctrl+U)
3. Search (Ctrl+F) for `type="email"` to find email field
4. Search for `type="tel"` to find phone field
5. Search for `postcode` or `zip` to find zip code field
6. Note all `id` and `name` attributes

### Method 3: Browser Console

1. Go to checkout page
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Type this and press Enter:
   ```javascript
   document.querySelectorAll('input, select, textarea')
   ```
5. Expand the results to see all form fields
6. Click each one to see its `id` and `name`

## Step 3: Create Your Field Mapping

Fill out this table with your actual field selectors:

| Data Field | Purpose | Your Field ID/Name |
|------------|---------|-------------------|
| First Name | Customer first name | `billing_first_name` |
| Last Name | Customer last name | `billing_last_name` |
| Email | Customer email | `billing_email` |
| Phone | Customer phone | `billing_phone` |
| Address Line 1 | Street address | `billing_address_1` |
| City | City | `billing_city` |
| State | State/Province | `billing_state` |
| Zip/Postal Code | Zip code | `billing_postcode` |
| Order Notes | Special instructions | `order_comments` |
| Delivery Date | Preferred delivery date | *(custom field)* |
| Project Type | Type of project | *(custom field)* |
| Materials | Materials ordered | *(custom field)* |
| Quantity | Amount ordered | *(custom field)* |

**Note:** If you have custom fields for delivery date, project type, materials, or quantity, you'll need to add their selectors too.

## Step 4: Update the Pre-population Script

Open `milestone-checkout-prepopulate.js` and find the `prePopulateForm()` function (around line 80).

### Example: Update Email Field

**Default code:**
```javascript
setFieldValue('#billing_email, [name="billing_email"], #email, [name="email"]', data.customerEmail);
```

**If your email field is different:**
```javascript
// Example: Your email field is id="customer_email"
setFieldValue('#customer_email, [name="customer_email"]', data.customerEmail);
```

### Example: Update Phone Field

**Default code:**
```javascript
setFieldValue('#billing_phone, [name="billing_phone"]', data.customerPhone);
```

**If your phone field is different:**
```javascript
// Example: Your phone field is id="phone_number" name="contact_phone"
setFieldValue('#phone_number, [name="contact_phone"]', data.customerPhone);
```

### Example: Add Custom Field for Delivery Date

**If you have a custom delivery date field:**

```javascript
// Add this in the prePopulateForm function
if (data.deliveryDate) {
  // Replace #your_delivery_date_id with your actual field ID
  setFieldValue('#your_delivery_date_id, [name="your_delivery_date_name"]', data.deliveryDate);
}
```

## Step 5: Test Your Customizations

### Testing Checklist

1. ✅ Open your website with the ConvAI widget
2. ✅ Start a conversation about ordering materials
3. ✅ Provide all information the agent requests:
   - Your name: "Test User"
   - Email: "test@example.com"
   - Phone: "555-1234"
   - Project: "Driveway"
   - Materials: "Gravel"
   - Quantity: "5 cubic yards"
   - Zip code: "90210"
   - Delivery address: "123 Test St, Test City, CA"
   - Delivery date: "2025-12-10"
4. ✅ Confirm the order when agent asks
5. ✅ Verify you're redirected to checkout
6. ✅ Check each field is pre-filled:
   - [ ] First name
   - [ ] Last name
   - [ ] Email
   - [ ] Phone
   - [ ] Address
   - [ ] City
   - [ ] State
   - [ ] Zip code
   - [ ] Order notes (if you provided special instructions)
   - [ ] Custom fields (delivery date, project type, etc.)

### If a Field Didn't Pre-populate

1. Open Browser Console (F12 → Console tab)
2. Look for errors or warnings
3. Check if the script logged: "Set field value: [selector] = [value]"
4. If you don't see that log, the selector is wrong
5. Go back to Step 2 and find the correct selector
6. Update the script with the correct selector
7. Test again

## Step 6: Handle Special Cases

### Case 1: Name in One Field (Not Split)

If your form has one field for full name instead of first/last:

```javascript
// Instead of splitting name, use it as-is
if (data.customerName) {
  setFieldValue('#full_name, [name="full_name"]', data.customerName);
}
```

### Case 2: Country Field

If your form requires a country field:

```javascript
// Add this to prePopulateForm function
if (data.deliveryCountry || 'US') {
  setFieldValue('#billing_country, [name="billing_country"]', 'US'); // or data.deliveryCountry
}
```

### Case 3: Required Checkboxes

If your form has required checkboxes (like "I agree to terms"):

```javascript
// Auto-check terms checkbox (use carefully!)
const termsCheckbox = document.querySelector('#terms, [name="terms"]');
if (termsCheckbox && termsCheckbox.type === 'checkbox') {
  termsCheckbox.checked = true;
  termsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
}
```

### Case 4: Dropdown Fields (State, Country, etc.)

For dropdown/select fields, the script already handles this with `setSelectValue()`.

**Make sure the value matches an option:**

```javascript
// If your state dropdown uses full names ("California" not "CA")
if (data.deliveryState) {
  // Convert CA to California
  const stateNames = {
    'CA': 'California',
    'NY': 'New York',
    'TX': 'Texas'
    // Add more as needed
  };
  const fullStateName = stateNames[data.deliveryState] || data.deliveryState;
  setSelectValue('#billing_state', fullStateName);
}
```

## Quick Reference: Selector Syntax

When updating selectors, you can use:

```javascript
// Single ID
'#field_id'

// Single name attribute
'[name="field_name"]'

// Multiple selectors (tries each until it finds one)
'#field_id, [name="field_name"], #alternate_id'

// Class selector (less reliable, but possible)
'.class-name'
```

## Common Issues

### Issue: "Field updates but then gets cleared"

**Cause:** Another script is overwriting the field after we populate it.

**Fix:** Add a delay:
```javascript
setTimeout(function() {
  prePopulateForm(checkoutData);
}, 500); // Wait 500ms before populating
```

### Issue: "Field populates but form validation fails"

**Cause:** Form expects specific format (e.g., phone as (555) 123-4567 not 555-123-4567)

**Fix:** Format the data before setting:
```javascript
// Example: Format phone number
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
}

setFieldValue('#billing_phone', formatPhone(data.customerPhone));
```

### Issue: "Script doesn't run at all"

**Cause:** Script loaded before form exists (AJAX checkout)

**Fix:** Already handled! The script listens for:
- `updated_checkout` event
- `woocommerce_checkout_updated` event

If your platform uses different events, add them:
```javascript
document.addEventListener('your_custom_checkout_event', initCheckoutPrePopulation);
```

## Need More Help?

### Debugging Steps

1. Open checkout page
2. Press F12 → Console tab
3. Type: `localStorage.getItem('milestoneCheckoutData')`
4. Press Enter
5. You should see the data object - verify it has all the information

### Still Stuck?

Create an issue with:
1. Your platform (WooCommerce, Shopify, Custom)
2. Screenshot of your checkout form
3. Screenshot of browser console showing any errors
4. The HTML of one problem field (right-click → Inspect → copy outer HTML)

---

**Pro Tip:** Start by getting just the email field working. Once you confirm that works, add the other fields one by one. This makes debugging much easier!
