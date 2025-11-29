/**
 * Milestone Trucks - Checkout Page Pre-population Script
 * This script reads data from the ConvAI conversation and pre-populates the checkout form
 *
 * Usage: Include this script on your checkout page (https://milestonetrucks.com/checkout/)
 */

(function() {
  'use strict';

  console.log('Milestone Checkout Pre-population Script Loaded');

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'milestoneCheckoutData',
    DATA_EXPIRY_MINUTES: 30,
    SHOW_CONFIRMATION_BANNER: true
  };

  /**
   * Initialize checkout pre-population
   */
  function initCheckoutPrePopulation() {
    // Try to get data from localStorage first, then sessionStorage
    const checkoutData = getCheckoutData();

    if (!checkoutData) {
      console.log('No ConvAI checkout data found');
      return;
    }

    console.log('Found ConvAI checkout data:', checkoutData);

    // Pre-populate the form
    prePopulateForm(checkoutData);

    // Show confirmation banner
    if (CONFIG.SHOW_CONFIRMATION_BANNER) {
      showConfirmationBanner(checkoutData);
    }

    // Clean up old data (optional - uncomment if you want to clear after use)
    // localStorage.removeItem(CONFIG.STORAGE_KEY);
    // sessionStorage.removeItem(CONFIG.STORAGE_KEY);
  }

  /**
   * Retrieve checkout data from storage
   */
  function getCheckoutData() {
    let dataString = localStorage.getItem(CONFIG.STORAGE_KEY);
    let storageType = 'localStorage';

    if (!dataString) {
      dataString = sessionStorage.getItem(CONFIG.STORAGE_KEY);
      storageType = 'sessionStorage';
    }

    if (!dataString) {
      return null;
    }

    try {
      const data = JSON.parse(dataString);

      // Check if data is expired
      if (data.timestamp) {
        const expiryTime = CONFIG.DATA_EXPIRY_MINUTES * 60 * 1000;
        const age = Date.now() - data.timestamp;

        if (age > expiryTime) {
          console.log('Checkout data expired (age: ' + Math.round(age / 60000) + ' minutes)');
          localStorage.removeItem(CONFIG.STORAGE_KEY);
          sessionStorage.removeItem(CONFIG.STORAGE_KEY);
          return null;
        }
      }

      console.log('Retrieved checkout data from ' + storageType);
      return data;

    } catch (error) {
      console.error('Error parsing checkout data:', error);
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      sessionStorage.removeItem(CONFIG.STORAGE_KEY);
      return null;
    }
  }

  /**
   * Pre-populate form fields with checkout data
   */
  function prePopulateForm(data) {
    console.log('Pre-populating form fields...');

    // Customer Name
    if (data.customerName) {
      const nameParts = data.customerName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFieldValue('#billing_first_name, [name="billing_first_name"], #first_name, [name="first_name"]', firstName);
      setFieldValue('#billing_last_name, [name="billing_last_name"], #last_name, [name="last_name"]', lastName);
      setFieldValue('#billing_full_name, [name="billing_full_name"], #full_name, [name="full_name"]', data.customerName);
    }

    // Customer Email
    if (data.customerEmail) {
      setFieldValue('#billing_email, [name="billing_email"], #email, [name="email"]', data.customerEmail);
    }

    // Customer Phone
    if (data.customerPhone) {
      setFieldValue('#billing_phone, [name="billing_phone"], #phone, [name="phone"]', data.customerPhone);
    }

    // Delivery Address
    if (data.deliveryAddress) {
      setFieldValue('#billing_address_1, [name="billing_address_1"], #address_1, [name="address_1"]', data.deliveryAddress);
      setFieldValue('#shipping_address_1, [name="shipping_address_1"]', data.deliveryAddress);
    }

    // City
    if (data.deliveryCity) {
      setFieldValue('#billing_city, [name="billing_city"], #city, [name="city"]', data.deliveryCity);
      setFieldValue('#shipping_city, [name="shipping_city"]', data.deliveryCity);
    }

    // State
    if (data.deliveryState) {
      setFieldValue('#billing_state, [name="billing_state"], #state, [name="state"]', data.deliveryState);
      setFieldValue('#shipping_state, [name="shipping_state"]', data.deliveryState);
    }

    // Zip Code
    if (data.deliveryZipCode) {
      setFieldValue('#billing_postcode, [name="billing_postcode"], #postcode, [name="postcode"], #zip, [name="zip"]', data.deliveryZipCode);
      setFieldValue('#shipping_postcode, [name="shipping_postcode"]', data.deliveryZipCode);
    }

    // Project Type (custom field)
    if (data.projectType) {
      setFieldValue('#project_type, [name="project_type"]', data.projectType);
      setSelectValue('#project_type, [name="project_type"]', data.projectType);
    }

    // Materials (custom field)
    if (data.materials) {
      setFieldValue('#materials, [name="materials"]', data.materials);
      setFieldValue('#product_name, [name="product_name"]', data.materials);
    }

    // Quantity
    if (data.quantity) {
      setFieldValue('#quantity, [name="quantity"]', data.quantity);
      setFieldValue('#order_quantity, [name="order_quantity"]', data.quantity);
    }

    // Quantity Unit
    if (data.quantityUnit) {
      setFieldValue('#quantity_unit, [name="quantity_unit"]', data.quantityUnit);
      setSelectValue('#quantity_unit, [name="quantity_unit"]', data.quantityUnit);
    }

    // Delivery Date
    if (data.deliveryDate) {
      setFieldValue('#delivery_date, [name="delivery_date"]', data.deliveryDate);
      setFieldValue('#preferred_delivery_date, [name="preferred_delivery_date"]', data.deliveryDate);
    }

    // Special Instructions / Order Notes
    if (data.specialInstructions) {
      setFieldValue('#order_comments, [name="order_comments"], #notes, [name="notes"], #special_instructions', data.specialInstructions);
    }

    // Display supplier information if available
    if (data.selectedSupplier) {
      displaySupplierInfo(data.selectedSupplier);
    }

    // Display truck information if available
    if (data.selectedTruck) {
      displayTruckInfo(data.selectedTruck);
    }

    // Display price estimate if available
    if (data.estimatedPrice) {
      displayPriceEstimate(data.estimatedPrice);
    }

    console.log('Form pre-population complete');
  }

  /**
   * Set value for a form field
   */
  function setFieldValue(selector, value) {
    if (!value) return;

    const field = document.querySelector(selector);
    if (field) {
      field.value = value;

      // Trigger change event for frameworks that listen to it
      const event = new Event('change', { bubbles: true });
      field.dispatchEvent(event);

      // Also trigger input event
      const inputEvent = new Event('input', { bubbles: true });
      field.dispatchEvent(inputEvent);

      console.log('Set field value:', selector, '=', value);
    }
  }

  /**
   * Set value for a select dropdown
   */
  function setSelectValue(selector, value) {
    if (!value) return;

    const select = document.querySelector(selector);
    if (select && select.tagName === 'SELECT') {
      // Try to find matching option by value or text
      const options = Array.from(select.options);
      const matchingOption = options.find(opt =>
        opt.value.toLowerCase() === value.toLowerCase() ||
        opt.text.toLowerCase() === value.toLowerCase()
      );

      if (matchingOption) {
        select.value = matchingOption.value;

        // Trigger change event
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);

        console.log('Set select value:', selector, '=', value);
      }
    }
  }

  /**
   * Display supplier information
   */
  function displaySupplierInfo(supplier) {
    // Look for a container to display supplier info
    let container = document.getElementById('convai-supplier-info');

    if (!container) {
      // Create container if it doesn't exist
      container = document.createElement('div');
      container.id = 'convai-supplier-info';
      container.className = 'convai-info-box supplier-info';

      // Try to insert before order review or at the top of checkout form
      const insertBefore = document.querySelector('.woocommerce-checkout-review-order, #order_review, .order-review');
      if (insertBefore) {
        insertBefore.parentNode.insertBefore(container, insertBefore);
      } else {
        const checkoutForm = document.querySelector('form.checkout, .woocommerce-checkout');
        if (checkoutForm) {
          checkoutForm.insertBefore(container, checkoutForm.firstChild);
        }
      }
    }

    container.innerHTML = `
      <div class="supplier-details">
        <h3>✓ Selected Supplier</h3>
        <div class="supplier-name"><strong>${supplier.name}</strong></div>
        ${supplier.distance ? `<div class="supplier-distance">Distance: ${supplier.distance} miles</div>` : ''}
        ${supplier.rating ? `<div class="supplier-rating">Rating: ${supplier.rating}/5 ⭐</div>` : ''}
        ${supplier.delivery_fee ? `<div class="supplier-fee">Delivery Fee: $${supplier.delivery_fee}</div>` : ''}
      </div>
    `;

    // Add some basic styling
    if (!document.getElementById('convai-info-styles')) {
      const style = document.createElement('style');
      style.id = 'convai-info-styles';
      style.textContent = `
        .convai-info-box {
          background: #f8f9fa;
          border: 2px solid #28a745;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .convai-info-box h3 {
          margin-top: 0;
          color: #28a745;
          font-size: 18px;
        }
        .convai-info-box > div > div {
          margin: 8px 0;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Display truck information
   */
  function displayTruckInfo(truck) {
    let container = document.getElementById('convai-truck-info');

    if (!container) {
      container = document.createElement('div');
      container.id = 'convai-truck-info';
      container.className = 'convai-info-box truck-info';

      const insertBefore = document.querySelector('.woocommerce-checkout-review-order, #order_review, .order-review');
      if (insertBefore) {
        insertBefore.parentNode.insertBefore(container, insertBefore);
      } else {
        const checkoutForm = document.querySelector('form.checkout, .woocommerce-checkout');
        if (checkoutForm) {
          checkoutForm.insertBefore(container, checkoutForm.firstChild);
        }
      }
    }

    container.innerHTML = `
      <div class="truck-details">
        <h3>🚛 Selected Delivery Truck</h3>
        <div class="truck-type"><strong>${truck.type}</strong></div>
        ${truck.capacity ? `<div class="truck-capacity">Capacity: ${truck.capacity} ${truck.capacity_unit || 'cubic yards'}</div>` : ''}
        ${truck.price ? `<div class="truck-price">Delivery: $${truck.price}</div>` : ''}
        ${truck.available_times && truck.available_times.length > 0 ?
          `<div class="truck-times">Available: ${truck.available_times.join(', ')}</div>` : ''}
      </div>
    `;
  }

  /**
   * Display price estimate
   */
  function displayPriceEstimate(estimate) {
    let container = document.getElementById('convai-price-estimate');

    if (!container) {
      container = document.createElement('div');
      container.id = 'convai-price-estimate';
      container.className = 'convai-info-box price-estimate';

      const insertBefore = document.querySelector('.woocommerce-checkout-review-order, #order_review, .order-review');
      if (insertBefore) {
        insertBefore.parentNode.insertBefore(container, insertBefore);
      }
    }

    container.innerHTML = `
      <div class="price-details">
        <h3>💰 Estimated Total</h3>
        <div class="price-breakdown">
          ${estimate.materials_cost ? `<div>Materials: $${estimate.materials_cost}</div>` : ''}
          ${estimate.delivery_fee ? `<div>Delivery: $${estimate.delivery_fee}</div>` : ''}
          ${estimate.tax ? `<div>Tax: $${estimate.tax}</div>` : ''}
          <div class="total"><strong>Total: $${estimate.total}</strong></div>
        </div>
      </div>
    `;
  }

  /**
   * Show confirmation banner
   */
  function showConfirmationBanner(data) {
    // Check if banner already exists
    if (document.getElementById('convai-confirmation-banner')) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'convai-confirmation-banner';
    banner.className = 'convai-confirmation-banner';
    banner.innerHTML = `
      <div class="banner-content">
        <span class="banner-icon">✓</span>
        <div class="banner-text">
          <strong>Information from your conversation has been added</strong>
          <p>Please review all details below and make any necessary changes before proceeding.</p>
        </div>
        <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add banner styling
    const style = document.createElement('style');
    style.textContent = `
      .convai-confirmation-banner {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        margin-bottom: 25px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideInDown 0.5s ease-out;
      }
      .convai-confirmation-banner .banner-content {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .convai-confirmation-banner .banner-icon {
        font-size: 32px;
        flex-shrink: 0;
      }
      .convai-confirmation-banner .banner-text strong {
        display: block;
        font-size: 18px;
        margin-bottom: 5px;
      }
      .convai-confirmation-banner .banner-text p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }
      .convai-confirmation-banner .banner-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 32px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        line-height: 1;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      .convai-confirmation-banner .banner-close:hover {
        opacity: 1;
      }
      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Insert banner at the top of the checkout form
    const checkoutForm = document.querySelector('form.checkout, .woocommerce-checkout, .checkout-form');
    if (checkoutForm) {
      checkoutForm.insertBefore(banner, checkoutForm.firstChild);
    } else {
      // Fallback: insert at top of main content
      const main = document.querySelector('main, .main-content, #main');
      if (main) {
        main.insertBefore(banner, main.firstChild);
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckoutPrePopulation);
  } else {
    initCheckoutPrePopulation();
  }

  // Also listen for dynamic form loads (AJAX checkouts)
  document.addEventListener('updated_checkout', initCheckoutPrePopulation);
  document.addEventListener('woocommerce_checkout_updated', initCheckoutPrePopulation);

})();
