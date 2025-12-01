# Milestone Trucks - ElevenLabs ConvAI Integration

Complete implementation for integrating the ElevenLabs Conversational AI widget with Milestone Trucks checkout flow.

## Overview

This implementation allows customers to:
1. Have a natural conversation with an AI sales rep
2. Get help finding the right materials for their project
3. See available suppliers and delivery trucks in their area
4. Get accurate pricing quotes
5. Be redirected to checkout with all information pre-populated
6. Simply review and confirm their order

## Architecture

```
Customer → ConvAI Widget → Gather Info → Check Suppliers → Check Trucks → Calculate Quote
                                                                                ↓
                                                                    Confirm Order Details
                                                                                ↓
                                                                    redirectToCheckout()
                                                                                ↓
                                                        Store Data in localStorage
                                                                                ↓
                                                    Redirect to /checkout/?params
                                                                                ↓
                                            Checkout Page Reads Data → Pre-populate Form
                                                                                ↓
                                            Customer Reviews → Submit Order
```

## Files in This Repository

### 1. `milestone-trucks-widget.js`
The main widget implementation with client tools. This file:
- Loads the ElevenLabs ConvAI widget
- Defines custom client tools (functions the AI can call)
- Handles responsive design (mobile/desktop)
- Manages theme colors

**Client Tools Included:**
- `redirectToCheckout` - Main tool to redirect with pre-populated data
- `getSuppliersByZip` - Fetch available suppliers by zip code
- `getAvailableTrucks` - Fetch available delivery trucks
- `calculateQuote` - Get pricing estimate
- `sendEmailInquiry` - Email support for complex questions
- `openSupportPage` - Open help documentation

### 2. `milestone-checkout-prepopulate.js`
Checkout page pre-population script. This file:
- Reads data from localStorage/sessionStorage
- Pre-fills all form fields with customer data
- Displays supplier/truck selections
- Shows price estimate
- Displays confirmation banner

### 3. `milestone-agent-system-prompt.md`
Complete system prompt for the ElevenLabs agent. Defines:
- Agent personality and tone
- Conversation flow (discovery → recommendation → confirmation → checkout)
- When and how to use each tool
- Guardrails and best practices
- Example conversations

### 4. `milestone-chatbot-workflow.json` & `milestone-chatbot-workflow-v2.json`
N8N workflow configurations (currently not connected to the agent, but available for future backend integration)

## Implementation Steps

### Step 1: Deploy Widget to Your Site

**Option A: Add to Footer (All Pages)**

Add this to your site's footer template (before `</body>`):

```html
<script src="https://yourdomain.com/milestone-trucks-widget.js"></script>
```

**Option B: Inline Script**

Copy the entire contents of `milestone-trucks-widget.js` and paste into your footer within `<script>` tags.

**Option C: WordPress (Recommended)**

1. Go to **Appearance → Theme File Editor**
2. Edit `footer.php` or use a plugin like "Insert Headers and Footers"
3. Add the script before `</body>` tag

### Step 2: Deploy Checkout Pre-population Script

Add to your **checkout page only** (`/checkout/`):

**WooCommerce:**
1. Go to **WooCommerce → Settings → Advanced → Checkout endpoints**
2. Or edit your checkout page template
3. Add before the checkout form:

```html
<script src="https://yourdomain.com/milestone-checkout-prepopulate.js"></script>
```

**Shopify:**
1. Go to **Settings → Checkout → Order status page → Additional scripts**
2. Add the script there

**Custom Platform:**
Add the script to your checkout page template.

### Step 3: Configure ElevenLabs Agent

1. Log into your ElevenLabs dashboard
2. Go to your agent settings (agent_0401kav5erfpe4jah92jpt04zvjf)
3. Update the **System Prompt** with contents from `milestone-agent-system-prompt.md`
4. Save changes

### Step 4: Set Up Backend APIs (Optional but Recommended)

The widget includes API calls to:
- `/api/suppliers?zip={zipCode}` - Get suppliers by zip
- `/api/trucks?zip={zipCode}&date={date}&quantity={quantity}` - Get available trucks
- `/api/calculate-quote` - Calculate order pricing

**Current Behavior:** These APIs return mock data for testing.

**For Production:** Replace the API URLs in `milestone-trucks-widget.js` with your actual endpoints.

**Quick N8N Setup (Alternative):**
You can use the included N8N workflows as a starting point to create these endpoints without building a custom backend.

### Step 5: Customize Form Field Selectors

The pre-population script includes generic selectors for common form fields. You may need to customize these based on your checkout form structure.

**To customize:**

1. Open `milestone-checkout-prepopulate.js`
2. Find the `prePopulateForm()` function
3. Update selectors to match your form field IDs/names:

```javascript
// Example: Update email field selector
setFieldValue('#your_email_field_id, [name="your_email_field_name"]', data.customerEmail);
```

**How to find your field selectors:**
1. Go to your checkout page
2. Right-click on a form field → Inspect Element
3. Look for `id="..."` or `name="..."` attributes
4. Update the selectors in the script

### Step 6: Test End-to-End

1. Open your site with the widget
2. Start a conversation: "I need gravel for my driveway"
3. Follow the agent's questions
4. Confirm your order when prompted
5. Verify you're redirected to checkout
6. Verify all fields are pre-populated
7. Check that supplier/truck info is displayed

## Customization Options

### Branding Colors

Edit `milestone-trucks-widget.js` in the `updateWidgetColors()` function:

```javascript
// Change these hex colors to match your brand
widget.setAttribute('avatar-orb-color-1', '#FF6B00'); // Primary color
widget.setAttribute('avatar-orb-color-2', '#FFB800'); // Secondary color
```

### Mobile Breakpoint

Change when the widget switches to mobile mode:

```javascript
const isMobile = window.innerWidth <= 768; // Change 768 to your preferred breakpoint
```

### Data Expiry Time

Change how long checkout data is valid:

```javascript
// In milestone-checkout-prepopulate.js
const CONFIG = {
  DATA_EXPIRY_MINUTES: 30, // Change to your preferred duration
  // ...
};
```

### Confirmation Banner

Disable or customize the confirmation banner:

```javascript
const CONFIG = {
  SHOW_CONFIRMATION_BANNER: true, // Set to false to disable
  // ...
};
```

## Troubleshooting

### Widget Not Appearing

**Check:**
1. Is the script loaded? (View page source, search for "milestone-trucks-widget")
2. Browser console errors? (F12 → Console tab)
3. Correct agent ID? (Should be `agent_0401kav5erfpe4jah92jpt04zvjf`)

**Fix:**
- Verify script is added before `</body>` tag
- Check for JavaScript errors in console
- Ensure ElevenLabs script CDN is accessible

### Form Not Pre-populating

**Check:**
1. Open browser console (F12 → Console)
2. Look for "Found ConvAI checkout data" message
3. Check localStorage: Go to Application tab → Local Storage → Check for `milestoneCheckoutData`

**Fix:**
- Ensure checkout script is loaded on checkout page
- Verify form field selectors match your actual form
- Check that you clicked through from widget (not direct URL)

### Agent Not Using Tools

**Check:**
1. Is the system prompt updated in ElevenLabs dashboard?
2. Are the client tools defined in the widget event listener?

**Fix:**
- Re-copy the system prompt from `milestone-agent-system-prompt.md`
- Verify the `elevenlabs-convai:call` event listener is set up correctly

### API Errors (404, 500)

**Expected:** The API endpoints don't exist yet, so mock data is returned.

**To Fix:**
- Build the backend APIs
- Or update the widget code to remove API calls and use static data
- Or implement using N8N workflows

## Advanced Features

### Add Google Analytics Tracking

Track when customers use the ConvAI widget to reach checkout:

```javascript
// In milestone-trucks-widget.js, inside redirectToCheckout function
gtag('event', 'convai_checkout', {
  'event_category': 'ConvAI',
  'event_label': 'Redirected to Checkout',
  'value': estimatedPrice?.total || 0
});
```

### Add to Cart Programmatically

For WooCommerce, you can add products to cart via AJAX:

```javascript
// In milestone-checkout-prepopulate.js
function addMaterialsToCart(materials, quantity, unit) {
  jQuery.ajax({
    url: wc_add_to_cart_params.ajax_url,
    type: 'POST',
    data: {
      action: 'woocommerce_add_to_cart',
      product_id: getProductIdByName(materials), // You need to implement this
      quantity: quantity
    },
    success: function(response) {
      console.log('Added to cart:', response);
    }
  });
}
```

### Multi-language Support

The ElevenLabs agent can support multiple languages. To enable:

1. In the agent dashboard, enable language detection
2. Update system prompt for each language
3. Widget will automatically adapt

## Security Considerations

### Data Storage

- Customer data is stored in `localStorage` (client-side only)
- Data expires after 30 minutes
- No sensitive payment information is stored

### Recommendations

1. **Use HTTPS** - Always serve over secure connection
2. **Validate server-side** - Don't trust client-side data alone
3. **Sanitize inputs** - Clean all form data before processing
4. **Add CSRF protection** - Secure your checkout form submission
5. **PCI compliance** - Follow payment card industry standards

## Support

### ElevenLabs Agent Issues
- ElevenLabs Documentation: https://elevenlabs.io/docs
- ElevenLabs Support: team@elevenlabs.io

### Implementation Help
- Check browser console for errors
- Review this README
- Test with mock data first before connecting real APIs

## Next Steps

1. ✅ Deploy widget to your site
2. ✅ Deploy checkout pre-population script
3. ✅ Configure agent system prompt
4. ✅ Test end-to-end flow
5. ⏳ Build backend APIs for suppliers/trucks/quotes
6. ⏳ Customize form field selectors
7. ⏳ Update branding colors
8. ⏳ Add analytics tracking
9. ⏳ Go live!

## Changelog

### Version 1.0 (2025-11-29)
- Initial implementation
- Widget with client tools
- Checkout pre-population
- Agent system prompt
- Mock data for testing
- Responsive design (mobile/desktop)
- Theme color support

## License

Proprietary - Milestone Trucks

---

**Questions?** Review the code comments in each file for detailed explanations of how everything works.
