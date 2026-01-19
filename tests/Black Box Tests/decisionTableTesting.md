# Shop360 Mobile App - Decision Table Testing

## Overview

Decision Table Testing is a black-box testing technique that uses a table format to represent different combinations of conditions and their corresponding actions/outcomes. This method ensures that each possible branch from each decision point is executed at least once, thereby ensuring that all reachable code is executed.

**Decision Table Testing Strategy:**
- **Condition Stubs**: List all conditions that affect the decision
- **Action Stubs**: List all possible actions/outcomes
- **Rules**: Each column represents a unique combination of conditions and their corresponding actions
- **Complete Coverage**: Test all possible combinations of conditions
- **Simplification**: Use "don't care" conditions where appropriate to reduce table size

**Decision Table Format:**
- **Y** = Yes / True / Condition is met
- **N** = No / False / Condition is not met
- **-** = Don't Care / Not Applicable
- **X** = Action is executed / Outcome occurs

---

## DT1: User Sign Up Decision Table

### Description
Tests all possible combinations of conditions when a user attempts to sign up with email and password.

### Conditions:
1. **C1**: Email format is valid
2. **C2**: Email is not already registered
3. **C3**: Password meets minimum length (≥6 characters)
4. **C4**: Password is strong (Firebase validation)
5. **C5**: Password and confirm password match
6. **C6**: Name field is not empty

### Actions:
1. **A1**: Create user account
2. **A2**: Send verification email
3. **A3**: Display error: "Invalid email format"
4. **A4**: Display error: "Email already in use"
5. **A5**: Display error: "Password must be at least 6 characters"
6. **A6**: Display error: "Password is too weak"
7. **A7**: Display error: "Passwords do not match"
8. **A8**: Display error: "Name is required"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | C6 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  | -  |    |    | X  |    |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  | -  |    |    |    | X  |    |    |    |    |
| R3   | Y  | Y  | N  | -  | -  | -  |    |    |    |    | X  |    |    |    |
| R4   | Y  | Y  | Y  | N  | -  | -  |    |    |    |    |    | X  |    |    |
| R5   | Y  | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    | X  |    |
| R6   | Y  | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    |    | X  |
| R7   | Y  | Y  | Y  | Y  | Y  | Y  | X  | X  |    |    |    |    |    |    |

### Test Cases:
- **DT1-R1**: Invalid email format → Error: "Invalid email format"
- **DT1-R2**: Valid email but already registered → Error: "Email already in use"
- **DT1-R3**: Valid email, password too short → Error: "Password must be at least 6 characters"
- **DT1-R4**: Valid email, password too weak → Error: "Password is too weak"
- **DT1-R5**: Valid email, passwords don't match → Error: "Passwords do not match"
- **DT1-R6**: Valid email, empty name → Error: "Name is required"
- **DT1-R7**: All conditions valid → Account created, verification email sent

---

## DT2: User Sign In Decision Table

### Description
Tests all possible combinations of conditions when a user attempts to sign in.

### Conditions:
1. **C1**: Email format is valid
2. **C2**: Email is registered in system
3. **C3**: Password is correct
4. **C4**: Email is verified
5. **C5**: Account is not disabled

### Actions:
1. **A1**: Sign in successful
2. **A2**: Navigate to home screen
3. **A3**: Display error: "Invalid email format"
4. **A4**: Display error: "User not found"
5. **A5**: Display error: "Wrong password"
6. **A6**: Display error: "Please verify your email"
7. **A7**: Display error: "Account is disabled"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 | A7 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  |    |    | X  |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  |    |    |    | X  |    |    |    |
| R3   | Y  | Y  | N  | -  | -  |    |    |    |    | X  |    |    |
| R4   | Y  | Y  | Y  | N  | Y  |    |    |    |    |    | X  |    |
| R5   | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    | X  |
| R6   | Y  | Y  | Y  | Y  | Y  | X  | X  |    |    |    |    |    |

### Test Cases:
- **DT2-R1**: Invalid email format → Error: "Invalid email format"
- **DT2-R2**: Email not registered → Error: "User not found"
- **DT2-R3**: Wrong password → Error: "Wrong password"
- **DT2-R4**: Email not verified → Error: "Please verify your email"
- **DT2-R5**: Account disabled → Error: "Account is disabled"
- **DT2-R6**: All conditions valid → Sign in successful, navigate to home

---

## DT3: Add Product to Cart Decision Table

### Description
Tests all possible combinations of conditions when adding a product to the shopping cart.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: Product is in stock (stock > 0)
3. **C3**: Product is not already in cart
4. **C4**: Requested quantity ≤ available stock
5. **C5**: Product is active/available

### Actions:
1. **A1**: Add product to cart successfully
2. **A2**: Update cart item quantity
3. **A3**: Display error: "Please sign in to add items to cart"
4. **A4**: Display error: "Product is out of stock"
5. **A5**: Display error: "Only X item(s) available in stock"
6. **A6**: Display error: "Product is not available"
7. **A7**: Show success message

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 | A7 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  |    |    | X  |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  |    |    |    | X  |    |    |    |
| R3   | Y  | Y  | Y  | N  | Y  |    |    |    |    | X  |    |    |
| R4   | Y  | Y  | -  | -  | N  |    |    |    |    |    | X  |    |
| R5   | Y  | Y  | Y  | Y  | Y  | X  |    |    |    |    |    | X  |
| R6   | Y  | Y  | N  | Y  | Y  |    | X  |    |    |    |    | X  |

### Test Cases:
- **DT3-R1**: User not authenticated → Error: "Please sign in to add items to cart"
- **DT3-R2**: Product out of stock → Error: "Product is out of stock"
- **DT3-R3**: Quantity exceeds stock → Error: "Only X item(s) available in stock"
- **DT3-R4**: Product not available → Error: "Product is not available"
- **DT3-R5**: All conditions valid, new item → Add to cart, show success
- **DT3-R6**: All conditions valid, item exists → Update quantity, show success

---

## DT4: Place Order Decision Table

### Description
Tests all possible combinations of conditions when placing an order from the cart.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: Cart is not empty
3. **C3**: Shipping address is selected
4. **C4**: Payment method is selected
5. **C5**: All cart items are in stock
6. **C6**: User email is verified
7. **C7**: Payment method is valid

### Actions:
1. **A1**: Create order successfully
2. **A2**: Deduct stock from products
3. **A3**: Clear cart items
4. **A4**: Send order confirmation notification
5. **A5**: Display error: "Please sign in to place order"
6. **A6**: Display error: "Cart is empty"
7. **A7**: Display error: "Please select a shipping address"
8. **A8**: Display error: "Please select a payment method"
9. **A9**: Display error: "Some items are out of stock"
10. **A10**: Display error: "Please verify your email"
11. **A11**: Display error: "Payment method is invalid"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | C6 | C7 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 | A10 | A11 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|-----|-----|
| R1   | N  | -  | -  | -  | -  | -  | -  |    |    |    |    | X  |    |    |    |    |     |     |
| R2   | Y  | N  | -  | -  | -  | -  | -  |    |    |    |    |    | X  |    |    |    |     |     |
| R3   | Y  | Y  | N  | -  | -  | -  | -  |    |    |    |    |    |    | X  |    |    |     |     |
| R4   | Y  | Y  | Y  | N  | -  | -  | -  |    |    |    |    |    |    |    | X  |    |     |     |
| R5   | Y  | Y  | Y  | Y  | N  | -  | -  |    |    |    |    |    |    |    |    | X  |     |     |
| R6   | Y  | Y  | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    |    |    |    | X   |     |
| R7   | Y  | Y  | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    |    |    |    |     | X   |
| R8   | Y  | Y  | Y  | Y  | Y  | Y  | Y  | X  | X  | X  | X  |    |    |    |    |    |     |     |

### Test Cases:
- **DT4-R1**: User not authenticated → Error: "Please sign in to place order"
- **DT4-R2**: Cart is empty → Error: "Cart is empty"
- **DT4-R3**: No shipping address → Error: "Please select a shipping address"
- **DT4-R4**: No payment method → Error: "Please select a payment method"
- **DT4-R5**: Items out of stock → Error: "Some items are out of stock"
- **DT4-R6**: Email not verified → Error: "Please verify your email"
- **DT4-R7**: Invalid payment method → Error: "Payment method is invalid"
- **DT4-R8**: All conditions valid → Order created, stock deducted, cart cleared, notification sent

---

## DT5: Order Cancellation Request Decision Table

### Description
Tests all possible combinations of conditions when a user requests to cancel an order.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: Order belongs to user
3. **C3**: Order status is "processing" or "pending"
4. **C4**: Order has not been shipped
5. **C5**: Cancellation request has not been submitted before

### Actions:
1. **A1**: Submit cancellation request successfully
2. **A2**: Update order status to "cancellation_requested"
3. **A3**: Send notification to admin
4. **A4**: Display error: "Please sign in"
5. **A5**: Display error: "Order not found"
6. **A6**: Display error: "Order cannot be cancelled"
7. **A7**: Display error: "Order has already been shipped"
8. **A8**: Display error: "Cancellation request already submitted"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  |    |    |    | X  |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  |    |    |    |    | X  |    |    |    |
| R3   | Y  | Y  | N  | -  | -  |    |    |    |    |    | X  |    |    |
| R4   | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    | X  |    |
| R5   | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    |    | X  |
| R6   | Y  | Y  | Y  | Y  | Y  | X  | X  | X  |    |    |    |    |    |

### Test Cases:
- **DT5-R1**: User not authenticated → Error: "Please sign in"
- **DT5-R2**: Order doesn't belong to user → Error: "Order not found"
- **DT5-R3**: Order status not cancellable → Error: "Order cannot be cancelled"
- **DT5-R4**: Order already shipped → Error: "Order has already been shipped"
- **DT5-R5**: Request already submitted → Error: "Cancellation request already submitted"
- **DT5-R6**: All conditions valid → Request submitted, status updated, admin notified

---

## DT6: Admin Order Cancellation Approval Decision Table

### Description
Tests all possible combinations of conditions when an admin approves or rejects an order cancellation request.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: User has admin role
3. **C3**: Order has cancellation request
4. **C4**: Order status is "cancellation_requested"
5. **C5**: Admin action is "approve" (vs "reject")

### Actions:
1. **A1**: Approve cancellation successfully
2. **A2**: Reject cancellation successfully
3. **A3**: Update order status to "cancelled"
4. **A4**: Update order status to original status
5. **A5**: Restore product stock
6. **A6**: Send notification to user
7. **A7**: Display error: "Please sign in"
8. **A8**: Display error: "Admin access required"
9. **A9**: Display error: "No cancellation request found"
10. **A10**: Display error: "Invalid order status"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 | A10 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|-----|
| R1   | N  | -  | -  | -  | -  |    |    |    |    |    |    | X  |    |    |     |
| R2   | Y  | N  | -  | -  | -  |    |    |    |    |    |    |    | X  |    |     |
| R3   | Y  | Y  | N  | -  | -  |    |    |    |    |    |    |    |    | X  |     |
| R4   | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    |    |    |    | X   |
| R5   | Y  | Y  | Y  | Y  | Y  | X  |    | X  |    | X  | X  |    |    |    |     |
| R6   | Y  | Y  | Y  | Y  | N  |    | X  |    | X  |    | X  |    |    |    |     |

### Test Cases:
- **DT6-R1**: User not authenticated → Error: "Please sign in"
- **DT6-R2**: User not admin → Error: "Admin access required"
- **DT6-R3**: No cancellation request → Error: "No cancellation request found"
- **DT6-R4**: Invalid order status → Error: "Invalid order status"
- **DT6-R5**: Approve cancellation → Order cancelled, stock restored, user notified
- **DT6-R6**: Reject cancellation → Order status restored, user notified

---

## DT7: AR View Access Decision Table

### Description
Tests all possible combinations of conditions when accessing the AR view for a product.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: Product has 3D model available
3. **C3**: Camera permission is granted
4. **C4**: AR tracking is ready
5. **C5**: Device supports AR (ARCore for Android)

### Actions:
1. **A1**: Initialize AR view successfully
2. **A2**: Load 3D model
3. **A3**: Enable plane detection
4. **A4**: Display error: "Please sign in to view AR"
5. **A5**: Display error: "3D model not available for this product"
6. **A6**: Display error: "Camera permission is required"
7. **A7**: Display error: "AR tracking is not ready"
8. **A8**: Display error: "AR is not supported on this device"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  |    |    |    | X  |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  |    |    |    |    | X  |    |    |    |
| R3   | Y  | Y  | N  | -  | -  |    |    |    |    |    | X  |    |    |
| R4   | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    | X  |    |
| R5   | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    |    | X  |
| R6   | Y  | Y  | Y  | Y  | Y  | X  | X  | X  |    |    |    |    |    |

### Test Cases:
- **DT7-R1**: User not authenticated → Error: "Please sign in to view AR"
- **DT7-R2**: No 3D model → Error: "3D model not available for this product"
- **DT7-R3**: Camera permission denied → Error: "Camera permission is required"
- **DT7-R4**: AR tracking not ready → Error: "AR tracking is not ready"
- **DT7-R5**: Device doesn't support AR → Error: "AR is not supported on this device"
- **DT7-R6**: All conditions valid → AR view initialized, model loaded, plane detection enabled

---

## DT8: Admin Dashboard Access Decision Table

### Description
Tests all possible combinations of conditions when accessing the admin dashboard.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: User has admin role
3. **C3**: User email is verified
4. **C4**: Admin account is active

### Actions:
1. **A1**: Display admin dashboard
2. **A2**: Load dashboard statistics
3. **A3**: Display error: "Please sign in"
4. **A4**: Display error: "Admin access required"
5. **A5**: Display error: "Please verify your email"
6. **A6**: Display error: "Admin account is disabled"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | A1 | A2 | A3 | A4 | A5 | A6 |
|------|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  |    |    | X  |    |    |    |
| R2   | Y  | N  | -  | -  |    |    |    | X  |    |    |
| R3   | Y  | Y  | N  | -  |    |    |    |    | X  |    |
| R4   | Y  | Y  | Y  | N  |    |    |    |    |    | X  |
| R5   | Y  | Y  | Y  | Y  | X  | X  |    |    |    |    |

### Test Cases:
- **DT8-R1**: User not authenticated → Error: "Please sign in"
- **DT8-R2**: User not admin → Error: "Admin access required"
- **DT8-R3**: Email not verified → Error: "Please verify your email"
- **DT8-R4**: Admin account disabled → Error: "Admin account is disabled"
- **DT8-R5**: All conditions valid → Admin dashboard displayed, statistics loaded

---

## DT9: Create Product (Admin) Decision Table

### Description
Tests all possible combinations of conditions when an admin creates a new product.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: User has admin role
3. **C3**: Product title is not empty
4. **C4**: Product price is valid (> 0)
5. **C5**: Product stock is valid (≥ 0)
6. **C6**: Product category exists
7. **C7**: Product images are uploaded

### Actions:
1. **A1**: Create product successfully
2. **A2**: Save product to database
3. **A3**: Display error: "Please sign in"
4. **A4**: Display error: "Admin access required"
5. **A5**: Display error: "Product title is required"
6. **A6**: Display error: "Price must be greater than zero"
7. **A7**: Display error: "Stock cannot be negative"
8. **A8**: Display error: "Category does not exist"
9. **A9**: Display error: "Product images are required"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | C6 | C7 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  | -  | -  |    |    | X  |    |    |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  | -  | -  |    |    |    | X  |    |    |    |    |    |
| R3   | Y  | Y  | N  | -  | -  | -  | -  |    |    |    |    | X  |    |    |    |    |
| R4   | Y  | Y  | Y  | N  | -  | -  | -  |    |    |    |    |    | X  |    |    |    |
| R5   | Y  | Y  | Y  | Y  | N  | -  | -  |    |    |    |    |    |    | X  |    |    |
| R6   | Y  | Y  | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    |    | X  |    |
| R7   | Y  | Y  | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    |    |    | X  |
| R8   | Y  | Y  | Y  | Y  | Y  | Y  | Y  | X  | X  |    |    |    |    |    |    |    |

### Test Cases:
- **DT9-R1**: User not authenticated → Error: "Please sign in"
- **DT9-R2**: User not admin → Error: "Admin access required"
- **DT9-R3**: Empty product title → Error: "Product title is required"
- **DT9-R4**: Invalid price → Error: "Price must be greater than zero"
- **DT9-R5**: Negative stock → Error: "Stock cannot be negative"
- **DT9-R6**: Invalid category → Error: "Category does not exist"
- **DT9-R7**: No images → Error: "Product images are required"
- **DT9-R8**: All conditions valid → Product created, saved to database

---

## DT10: Update Order Status (Admin) Decision Table

### Description
Tests all possible combinations of conditions when an admin updates an order status.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: User has admin role
3. **C3**: Order exists
4. **C4**: New status is valid
5. **C5**: Status transition is allowed (e.g., cannot go from "delivered" to "processing")
6. **C6**: Order is not cancelled

### Actions:
1. **A1**: Update order status successfully
2. **A2**: Send notification to user (if status is "shipped" or "delivered")
3. **A3**: Display error: "Please sign in"
4. **A4**: Display error: "Admin access required"
5. **A5**: Display error: "Order not found"
6. **A6**: Display error: "Invalid order status"
7. **A7**: Display error: "Invalid status transition"
8. **A8**: Display error: "Cannot update cancelled order"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | C6 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  | -  |    |    | X  |    |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  | -  |    |    |    | X  |    |    |    |    |
| R3   | Y  | Y  | N  | -  | -  | -  |    |    |    |    | X  |    |    |    |
| R4   | Y  | Y  | Y  | N  | -  | -  |    |    |    |    |    | X  |    |    |
| R5   | Y  | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    | X  |    |
| R6   | Y  | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    |    | X  |
| R7   | Y  | Y  | Y  | Y  | Y  | Y  | X  | X  |    |    |    |    |    |    |

### Test Cases:
- **DT10-R1**: User not authenticated → Error: "Please sign in"
- **DT10-R2**: User not admin → Error: "Admin access required"
- **DT10-R3**: Order doesn't exist → Error: "Order not found"
- **DT10-R4**: Invalid status → Error: "Invalid order status"
- **DT10-R5**: Invalid transition → Error: "Invalid status transition"
- **DT10-R6**: Order is cancelled → Error: "Cannot update cancelled order"
- **DT10-R7**: All conditions valid → Status updated, user notified (if applicable)

---

## DT11: Password Reset Decision Table

### Description
Tests all possible combinations of conditions when a user requests password reset.

### Conditions:
1. **C1**: Email format is valid
2. **C2**: Email is registered in system
3. **C3**: New password meets minimum length (≥6 characters)
4. **C4**: New password is strong (Firebase validation)
5. **C5**: Reset token is valid (if applicable)

### Actions:
1. **A1**: Send password reset email
2. **A2**: Update password successfully
3. **A3**: Display error: "Invalid email format"
4. **A4**: Display error: "Email not found"
5. **A5**: Display error: "Password must be at least 6 characters"
6. **A6**: Display error: "Password is too weak"
7. **A7**: Display error: "Invalid or expired reset token"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 | A7 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  |    |    | X  |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  |    |    |    | X  |    |    |    |
| R3   | Y  | Y  | -  | -  | -  | X  |    |    |    |    |    |    |
| R4   | Y  | Y  | N  | -  | Y  |    |    |    |    | X  |    |    |
| R5   | Y  | Y  | Y  | N  | Y  |    |    |    |    |    | X  |    |
| R6   | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    | X  |
| R7   | Y  | Y  | Y  | Y  | Y  |    | X  |    |    |    |    |    |

### Test Cases:
- **DT11-R1**: Invalid email format → Error: "Invalid email format"
- **DT11-R2**: Email not registered → Error: "Email not found"
- **DT11-R3**: Request reset (valid email) → Reset email sent
- **DT11-R4**: New password too short → Error: "Password must be at least 6 characters"
- **DT11-R5**: New password too weak → Error: "Password is too weak"
- **DT11-R6**: Invalid reset token → Error: "Invalid or expired reset token"
- **DT11-R7**: All conditions valid → Password updated successfully

---

## DT12: Update Cart Quantity Decision Table

### Description
Tests all possible combinations of conditions when updating cart item quantity.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: Cart item exists
3. **C3**: New quantity > 0
4. **C4**: New quantity ≤ available stock
5. **C5**: Product is still in stock (stock > 0)

### Actions:
1. **A1**: Update quantity successfully
2. **A2**: Recalculate cart total
3. **A3**: Display error: "Please sign in"
4. **A4**: Display error: "Cart item not found"
5. **A5**: Display error: "Quantity must be greater than zero"
6. **A6**: Display error: "Only X item(s) available in stock"
7. **A7**: Display error: "Product is out of stock"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 | A7 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  |    |    | X  |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  |    |    |    | X  |    |    |    |
| R3   | Y  | Y  | N  | -  | -  |    |    |    |    | X  |    |    |
| R4   | Y  | Y  | Y  | N  | Y  |    |    |    |    |    | X  |    |
| R5   | Y  | Y  | Y  | -  | N  |    |    |    |    |    |    | X  |
| R6   | Y  | Y  | Y  | Y  | Y  | X  | X  |    |    |    |    |    |

### Test Cases:
- **DT12-R1**: User not authenticated → Error: "Please sign in"
- **DT12-R2**: Cart item doesn't exist → Error: "Cart item not found"
- **DT12-R3**: Quantity is zero → Error: "Quantity must be greater than zero"
- **DT12-R4**: Quantity exceeds stock (but product has stock) → Error: "Only X item(s) available in stock"
- **DT12-R5**: Product out of stock → Error: "Product is out of stock"
- **DT12-R6**: All conditions valid → Quantity updated, cart total recalculated

---

## DT13: Add Payment Card Decision Table

### Description
Tests all possible combinations of conditions when adding a payment card.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: Card number is valid (16 digits, passes Luhn algorithm)
3. **C3**: CVV is valid (3-4 digits)
4. **C4**: Expiry date is valid (not expired)
5. **C5**: Cardholder name is not empty
6. **C6**: Card is not duplicate

### Actions:
1. **A1**: Add payment card successfully
2. **A2**: Save card to user profile
3. **A3**: Display error: "Please sign in"
4. **A4**: Display error: "Invalid card number"
5. **A5**: Display error: "Invalid CVV"
6. **A6**: Display error: "Card has expired"
7. **A7**: Display error: "Cardholder name is required"
8. **A8**: Display error: "Card already exists"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | C6 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  | -  |    |    | X  |    |    |    |    |    |
| R2   | Y  | N  | -  | -  | -  | -  |    |    |    | X  |    |    |    |    |
| R3   | Y  | Y  | N  | -  | -  | -  |    |    |    |    | X  |    |    |    |
| R4   | Y  | Y  | Y  | N  | -  | -  |    |    |    |    |    | X  |    |    |
| R5   | Y  | Y  | Y  | Y  | N  | -  |    |    |    |    |    |    | X  |    |
| R6   | Y  | Y  | Y  | Y  | Y  | N  |    |    |    |    |    |    |    | X  |
| R7   | Y  | Y  | Y  | Y  | Y  | Y  | X  | X  |    |    |    |    |    |    |

### Test Cases:
- **DT13-R1**: User not authenticated → Error: "Please sign in"
- **DT13-R2**: Invalid card number → Error: "Invalid card number"
- **DT13-R3**: Invalid CVV → Error: "Invalid CVV"
- **DT13-R4**: Card expired → Error: "Card has expired"
- **DT13-R5**: Empty cardholder name → Error: "Cardholder name is required"
- **DT13-R6**: Duplicate card → Error: "Card already exists"
- **DT13-R7**: All conditions valid → Card added, saved to profile

---

## DT14: Email Verification Requirement Decision Table

### Description
Tests which features require email verification and which don't.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: User email is verified
3. **C3**: Feature requires email verification

### Actions:
1. **A1**: Allow access to feature
2. **A2**: Display error: "Please verify your email"
3. **A3**: Display error: "Please sign in"

### Features and Verification Requirements:
- **Requires Verification**: Place Order, View Notifications, Admin Dashboard, Submit Support Ticket
- **Doesn't Require Verification**: Browse Products, View Product Details, Add to Cart (guest), View Cart

### Decision Table:

| Rule | C1 | C2 | C3 | A1 | A2 | A3 |
|------|----|----|----|----|----|----|
| R1   | N  | -  | -  |    |    | X  |
| R2   | Y  | N  | Y  |    | X  |    |
| R3   | Y  | Y  | Y  | X  |    |    |
| R4   | Y  | N  | N  | X  |    |    |
| R5   | Y  | Y  | N  | X  |    |    |

### Test Cases:
- **DT14-R1**: User not authenticated → Error: "Please sign in"
- **DT14-R2**: Email not verified, feature requires it → Error: "Please verify your email"
- **DT14-R3**: Email verified, feature requires it → Access allowed
- **DT14-R4**: Email not verified, feature doesn't require it → Access allowed
- **DT14-R5**: Email verified, feature doesn't require it → Access allowed

---

## DT15: Wishlist Add/Remove Decision Table

### Description
Tests all possible combinations of conditions when adding or removing items from wishlist.

### Conditions:
1. **C1**: User is authenticated
2. **C2**: Product exists
3. **C3**: Product is not already in wishlist (for add)
4. **C4**: Product is in wishlist (for remove)
5. **C5**: Action is "add" (vs "remove")

### Actions:
1. **A1**: Add to wishlist successfully
2. **A2**: Remove from wishlist successfully
3. **A3**: Display error: "Please sign in"
4. **A4**: Display error: "Product not found"
5. **A5**: Display error: "Product already in wishlist"
6. **A6**: Display error: "Product not in wishlist"

### Decision Table:

| Rule | C1 | C2 | C3 | C4 | C5 | A1 | A2 | A3 | A4 | A5 | A6 |
|------|----|----|----|----|----|----|----|----|----|----|----|
| R1   | N  | -  | -  | -  | -  |    |    | X  |    |    |    |
| R2   | Y  | N  | -  | -  | -  |    |    |    | X  |    |    |
| R3   | Y  | Y  | N  | -  | Y  |    |    |    |    | X  |    |
| R4   | Y  | Y  | Y  | -  | Y  | X  |    |    |    |    |    |
| R5   | Y  | Y  | -  | N  | N  |    |    |    |    |    | X  |
| R6   | Y  | Y  | -  | Y  | N  |    | X  |    |    |    |    |

### Test Cases:
- **DT15-R1**: User not authenticated → Error: "Please sign in"
- **DT15-R2**: Product doesn't exist → Error: "Product not found"
- **DT15-R3**: Add: Product already in wishlist → Error: "Product already in wishlist"
- **DT15-R4**: Add: All conditions valid → Added to wishlist
- **DT15-R5**: Remove: Product not in wishlist → Error: "Product not in wishlist"
- **DT15-R6**: Remove: All conditions valid → Removed from wishlist

---

## Summary

This document covers all major decision tables for the Shop360 mobile app. Decision table testing ensures comprehensive coverage of all possible combinations of conditions and their corresponding actions, making it an effective technique for identifying edge cases and ensuring all code paths are tested.

### Key Decision Points Covered:

1. **Authentication**: Sign Up, Sign In, Password Reset
2. **Shopping**: Add to Cart, Update Cart Quantity, Place Order
3. **Order Management**: Order Cancellation, Status Updates, Admin Approval
4. **AR Functionality**: AR View Access, Model Loading, Tracking
5. **Admin Functions**: Dashboard Access, Product Management, Order Management
6. **User Management**: Payment Cards, Wishlist, Email Verification
7. **Access Control**: Role-based access, Email verification requirements

### Decision Table Testing Benefits:

1. **Complete Coverage**: Tests all possible combinations of conditions
2. **Systematic Approach**: Organized table format makes it easy to identify missing test cases
3. **Error Detection**: Helps identify edge cases and boundary conditions
4. **Documentation**: Serves as clear documentation of system behavior
5. **Maintainability**: Easy to update when requirements change
6. **Traceability**: Each rule can be traced to specific test cases

### Testing Strategy:

- **Positive Testing**: Rules where all conditions are met (successful paths)
- **Negative Testing**: Rules where conditions are not met (error paths)
- **Boundary Testing**: Rules testing edge cases and boundary conditions
- **Integration Testing**: Rules testing interactions between multiple conditions

Each decision table includes:
- **Conditions**: All factors that affect the decision
- **Actions**: All possible outcomes/actions
- **Rules**: Unique combinations of conditions and their corresponding actions
- **Test Cases**: Specific test scenarios for each rule