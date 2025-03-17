import { DiscountApplicationStrategy, run } from "@shopify/shopify-functions";

/**
 * @typedef {import("@shopify/shopify-functions").FunctionInput} FunctionInput
 * @typedef {import("@shopify/shopify-functions").FunctionResult} FunctionResult
 */

// Define discount levels and max caps
const membershipDiscounts = {
  "Level 1": { percentage: 10, maxDiscount: 20 },
  "Level 2": { percentage: 20, maxDiscount: 35 },
  "Level 3": { percentage: 30, maxDiscount: 50 },
};

/**
 * @param {FunctionInput} input
 * @returns {FunctionResult}
 */
export function applyDiscount(input) {
  const { cart, customer } = input;
  const discounts = [];

  if (!customer) {
    return { discounts, discountApplicationStrategy: DiscountApplicationStrategy.Maximum };
  }

  // Find the highest discount level the customer qualifies for
  let applicableDiscount = null;
  for (const level in membershipDiscounts) {
    if (customer.tags.includes(level)) {
      applicableDiscount = membershipDiscounts[level];
    }
  }

  // If no membership tag found, return no discount
  if (!applicableDiscount) {
    return { discounts, discountApplicationStrategy: DiscountApplicationStrategy.Maximum };
  }

  // Calculate discount value
  const orderTotal = cart.cost.totalAmount.amount;
  let discountValue = (orderTotal * applicableDiscount.percentage) / 100;

  // Apply max discount cap
  if (discountValue > applicableDiscount.maxDiscount) {
    discountValue = applicableDiscount.maxDiscount;
  }

  // Apply the discount to the order
  discounts.push({
    value: {
      amount: discountValue.toFixed(2), // Format to two decimal places
    },
    target: "ORDER",
  });

  return { discounts, discountApplicationStrategy: DiscountApplicationStrategy.Maximum };
}

run(applyDiscount);
