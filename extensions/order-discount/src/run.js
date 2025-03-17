// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {Object} Customer
 * @property {string[]} tags
 *
 * @typedef {Object} CartLine
 * @property {Object} merchandise
 * @property {string} merchandise.id
 * @property {Object} merchandise.price
 * @property {string} merchandise.price.amount
 *
 * @typedef {Object} Cart
 * @property {CartLine[]} lines
 * @property {Object} cost
 * @property {Object} cost.totalAmount
 * @property {string} cost.totalAmount.amount
 *
 * @typedef {Object} RunInput
 * @property {Cart} cart
 * @property {Customer} customer
 *
 * @typedef {Object} FunctionRunResult
 * @property {string} discountApplicationStrategy
 * @property {Object[]} discounts
 */

/**
 * Discount Levels and Max Caps
 */
const membershipDiscounts = {
  "Level 1": { percentage: 10, maxDiscount: 20 },
  "Level 2": { percentage: 20, maxDiscount: 35 },
  "Level 3": { percentage: 30, maxDiscount: 50 },
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  /** @type {Cart} */
  const cart = input?.cart || { lines: [], cost: { totalAmount: { amount: "0" } } };
  
  /** @type {Customer} */
  const customer = input?.customer || { tags: [] };

  const discounts = [];

  // If customer has no membership tag, return no discount
  let applicableDiscount = null;
  for (const level in membershipDiscounts) {
    if (customer.tags.includes(level)) {
      applicableDiscount = membershipDiscounts[level];
    }
  }

  if (!applicableDiscount) {
    return { discountApplicationStrategy: DiscountApplicationStrategy.First, discounts };
  }

  // Loop through cart items and apply discount per product
  cart.lines.forEach((line) => {
    const productPrice = parseFloat(line.merchandise?.price?.amount || "0");
    let discountAmount = (applicableDiscount.percentage / 100) * productPrice;
    discountAmount = Math.min(discountAmount, applicableDiscount.maxDiscount);

    if (discountAmount > 0) {
      discounts.push({
        value: { amount: discountAmount.toFixed(2) },
        targets: [{ productVariant: line.merchandise.id }],
        message: `Membership discount: ${applicableDiscount.percentage}% off (Max $${applicableDiscount.maxDiscount})`,
      });
    }
  });

  return { discountApplicationStrategy: DiscountApplicationStrategy.First, discounts };
}
