/**
 * Milestone Trucks - ElevenLabs ConvAI Widget Implementation
 * This script injects the conversational AI widget into the Milestone Trucks website
 * and provides custom client tools for checkout integration
 */

const MILESTONE_WIDGET_ID = 'milestone-trucks-convai-widget';
const AGENT_ID = 'agent_0401kav5erfpe4jah92jpt04zvjf';

function injectMilestoneConvAIWidget() {
  // Check if the widget is already loaded
  if (document.getElementById(MILESTONE_WIDGET_ID)) {
    console.log('Milestone ConvAI widget already loaded');
    return;
  }

  // Load the ElevenLabs widget embed script
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
  script.async = true;
  script.type = 'text/javascript';
  document.head.appendChild(script);

  // Create the wrapper and widget elements
  const wrapper = document.createElement('div');
  wrapper.className = 'milestone-convai-wrapper';

  const widget = document.createElement('elevenlabs-convai');
  widget.id = MILESTONE_WIDGET_ID;
  widget.setAttribute('agent-id', AGENT_ID);
  widget.setAttribute('variant', 'full');

  // Set initial variant and colors based on device and theme
  updateWidgetVariant(widget);
  updateWidgetColors(widget);

  // Watch for theme changes (if your site has light/dark mode)
  const themeObserver = new MutationObserver(() => {
    updateWidgetColors(widget);
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });

  // Add resize listener for responsive behavior
  window.addEventListener('resize', () => {
    updateWidgetVariant(widget);
  });

  /**
   * Update widget variant based on screen size
   */
  function updateWidgetVariant(widget) {
    const isMobile = window.innerWidth <= 768; // Tablet/mobile breakpoint
    if (isMobile) {
      widget.setAttribute('variant', 'expandable');
    } else {
      widget.setAttribute('variant', 'full');
    }
  }

  /**
   * Update widget colors based on theme
   * Customize these colors to match your brand
   */
  function updateWidgetColors(widget) {
    // Check if site has dark mode (adjust selector as needed)
    const isDarkMode = document.documentElement.classList.contains('dark-mode') ||
                       document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDarkMode) {
      widget.setAttribute('avatar-orb-color-1', '#2E2E2E');
      widget.setAttribute('avatar-orb-color-2', '#B8B8B8');
    } else {
      // Milestone Trucks brand colors (adjust as needed)
      widget.setAttribute('avatar-orb-color-1', '#FF6B00'); // Orange
      widget.setAttribute('avatar-orb-color-2', '#FFB800'); // Yellow
    }
  }

  /**
   * Listen for the widget's "call" event to inject client tools
   * This is where we define custom functions the AI agent can call
   */
  widget.addEventListener('elevenlabs-convai:call', (event) => {
    console.log('Milestone ConvAI widget call event triggered');

    event.detail.config.clientTools = {

      /**
       * Primary Tool: Redirect to checkout with pre-populated data
       * Called by the agent when customer is ready to place an order
       */
      redirectToCheckout: (orderData) => {
        console.log('Redirecting to checkout with data:', orderData);

        const {
          customerName = '',
          customerEmail = '',
          customerPhone = '',
          projectType = '',
          materials = '',
          quantity = '',
          quantityUnit = '',
          deliveryZipCode = '',
          deliveryAddress = '',
          deliveryCity = '',
          deliveryState = '',
          deliveryDate = '',
          specialInstructions = '',
          selectedSupplier = null,
          selectedTruck = null,
          estimatedPrice = null
        } = orderData;

        // Store comprehensive data in localStorage for checkout page
        const checkoutData = {
          customerName,
          customerEmail,
          customerPhone,
          projectType,
          materials,
          quantity,
          quantityUnit,
          deliveryZipCode,
          deliveryAddress,
          deliveryCity,
          deliveryState,
          deliveryDate,
          specialInstructions,
          selectedSupplier,
          selectedTruck,
          estimatedPrice,
          timestamp: Date.now(),
          source: 'convai'
        };

        localStorage.setItem('milestoneCheckoutData', JSON.stringify(checkoutData));

        // Also store in sessionStorage as backup
        sessionStorage.setItem('milestoneCheckoutData', JSON.stringify(checkoutData));

        // Build URL parameters for immediate visibility
        const params = new URLSearchParams({
          email: customerEmail,
          phone: customerPhone,
          zip: deliveryZipCode,
          source: 'convai',
          materials: materials,
          qty: quantity
        });

        // Redirect to checkout page
        window.location.href = `https://milestonetrucks.com/checkout/?${params.toString()}`;
      },

      /**
       * Helper Tool: Get available suppliers by zip code
       * Returns list of suppliers serving the given area
       */
      getSuppliersByZip: async ({ zipCode }) => {
        console.log('Fetching suppliers for zip:', zipCode);

        try {
          // TODO: Replace with your actual API endpoint
          const response = await fetch(`https://milestonetrucks.com/api/suppliers?zip=${zipCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const suppliers = await response.json();
          return suppliers;

        } catch (error) {
          console.error('Error fetching suppliers:', error);

          // Return mock data for testing/development
          // TODO: Remove this mock data once API is ready
          return [
            {
              id: 'sup_001',
              name: 'ABC Materials Supply',
              distance: 5.2,
              rating: 4.8,
              materials_available: ['gravel', 'topsoil', 'sand', 'mulch'],
              delivery_fee: 75
            },
            {
              id: 'sup_002',
              name: 'XYZ Aggregate Co.',
              distance: 8.7,
              rating: 4.6,
              materials_available: ['gravel', 'crushed_stone', 'decorative_rock'],
              delivery_fee: 95
            }
          ];
        }
      },

      /**
       * Helper Tool: Get available delivery trucks
       * Returns trucks available for the specified date, location, and quantity
       */
      getAvailableTrucks: async ({ zipCode, deliveryDate, quantity, quantityUnit = 'cubic_yards' }) => {
        console.log('Fetching trucks for:', { zipCode, deliveryDate, quantity, quantityUnit });

        try {
          // TODO: Replace with your actual API endpoint
          const params = new URLSearchParams({
            zip: zipCode,
            date: deliveryDate,
            quantity: quantity,
            unit: quantityUnit
          });

          const response = await fetch(`https://milestonetrucks.com/api/trucks?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const trucks = await response.json();
          return trucks;

        } catch (error) {
          console.error('Error fetching trucks:', error);

          // Return mock data for testing/development
          // TODO: Remove this mock data once API is ready
          return [
            {
              id: 'truck_001',
              type: 'Standard Dump Truck',
              capacity: 10,
              capacity_unit: 'cubic_yards',
              available_times: ['8:00 AM - 12:00 PM', '1:00 PM - 5:00 PM'],
              price: 150,
              features: ['GPS tracking', 'Same-day delivery']
            },
            {
              id: 'truck_002',
              type: 'Large Dump Truck',
              capacity: 20,
              capacity_unit: 'cubic_yards',
              available_times: ['8:00 AM - 12:00 PM'],
              price: 225,
              features: ['GPS tracking', 'Commercial grade']
            }
          ];
        }
      },

      /**
       * Helper Tool: Calculate delivery quote
       * Returns pricing breakdown for the order
       */
      calculateQuote: async ({ materials, quantity, quantityUnit, zipCode, deliveryDate, supplierId = null }) => {
        console.log('Calculating quote for:', { materials, quantity, quantityUnit, zipCode, deliveryDate, supplierId });

        try {
          // TODO: Replace with your actual API endpoint
          const response = await fetch('https://milestonetrucks.com/api/calculate-quote', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              materials,
              quantity,
              quantityUnit,
              zipCode,
              deliveryDate,
              supplierId
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const quote = await response.json();
          return quote;

        } catch (error) {
          console.error('Error calculating quote:', error);

          // Return mock quote for testing/development
          // TODO: Remove this mock data once API is ready
          const materialPrice = parseFloat(quantity) * 45; // $45 per cubic yard
          const deliveryFee = 85;
          const tax = (materialPrice + deliveryFee) * 0.08;
          const total = materialPrice + deliveryFee + tax;

          return {
            materials_cost: materialPrice.toFixed(2),
            delivery_fee: deliveryFee.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            currency: 'USD',
            breakdown: [
              { item: materials, quantity: quantity, unit_price: 45, subtotal: materialPrice },
              { item: 'Delivery Fee', quantity: 1, unit_price: deliveryFee, subtotal: deliveryFee },
              { item: 'Tax (8%)', quantity: 1, unit_price: tax, subtotal: tax }
            ]
          };
        }
      },

      /**
       * Helper Tool: Send email inquiry
       * For cases where the agent needs to escalate to human support
       */
      sendEmailInquiry: ({ customerEmail, subject, message }) => {
        console.log('Sending email inquiry:', { customerEmail, subject, message });

        const encodedSubject = encodeURIComponent(subject || 'Customer Inquiry from ConvAI');
        const encodedBody = encodeURIComponent(
          `From: ${customerEmail}\n\n${message}\n\n---\nSent via Milestone Trucks ConvAI Assistant`
        );

        window.open(
          `mailto:sales@milestonetrucks.com?subject=${encodedSubject}&body=${encodedBody}`,
          '_blank'
        );
      },

      /**
       * Helper Tool: Open support page
       * Direct customers to FAQ or support resources
       */
      openSupportPage: ({ topic = 'general' }) => {
        console.log('Opening support page for topic:', topic);

        const supportPages = {
          general: 'https://milestonetrucks.com/support/',
          delivery: 'https://milestonetrucks.com/delivery-info/',
          materials: 'https://milestonetrucks.com/materials-guide/',
          pricing: 'https://milestonetrucks.com/pricing/',
          faq: 'https://milestonetrucks.com/faq/'
        };

        const url = supportPages[topic] || supportPages.general;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };
  });

  // Attach widget to the DOM
  wrapper.appendChild(widget);
  document.body.appendChild(wrapper);

  console.log('Milestone ConvAI widget injected successfully');
}

// Initialize widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectMilestoneConvAIWidget);
} else {
  injectMilestoneConvAIWidget();
}

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { injectMilestoneConvAIWidget };
}
