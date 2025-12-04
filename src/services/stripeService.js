import { loadStripe } from "@stripe/stripe-js";
import secureStorage from "../utils/secureStorage";

const STRIPE_PUBLISHABLE_KEY =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51SSY0HHm3uqWbUBdbs51YRJmeEAiPzJVFfPDsZqtaevAnsh0IZ8KcJa7DiJoerdZdaN6ulGziT514E0S2cD8Y4i000oziVNNqt";

class StripeService {
  constructor() {
    this.stripePromise = null;
  }

  /**
   * Initialize Stripe
   */
  async getStripe() {
    if (!this.stripePromise) {
      this.stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return this.stripePromise;
  }

  /**
   * Create payment intent client secret from backend response
   * Backend creates the PaymentIntent, we just use the clientSecret
   */
  async initializePaymentForm(clientSecret) {
    const stripe = await this.getStripe();
    if (!stripe) {
      throw new Error("Stripe failed to load");
    }
    return stripe;
  }

  /**
   * Confirm payment with payment method
   */
  async confirmPayment(stripe, clientSecret, paymentMethodId, returnUrl) {
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
        return_url: returnUrl,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (error) {
      console.error("Payment confirmation error:", error);
      throw error;
    }
  }

  /**
   * Create payment method from card details
   */
  async createPaymentMethod(stripe, card) {
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: card,
      });

      if (error) {
        throw new Error(error.message);
      }

      return paymentMethod.id;
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw error;
    }
  }

  /**
   * Get payment method details
   */
  async getPaymentMethodDetails(stripe, paymentMethodId) {
    try {
      const paymentMethod = await stripe.retrievePaymentMethod(
        paymentMethodId
      );
      return paymentMethod;
    } catch (error) {
      console.error("Error retrieving payment method:", error);
      throw error;
    }
  }

  /**
   * Format price for display (cents to dollars)
   */
  formatPrice(cents, currency = "usd") {
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Parse price input (dollars to cents)
   */
  parsePrice(dollars) {
    return Math.round(dollars * 100);
  }
}

export default new StripeService();
