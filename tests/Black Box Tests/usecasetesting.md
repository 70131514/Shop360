# Shop360 Mobile App - Use Case Testing

## Overview

Use Case Testing is a functional black-box testing technique that helps testers identify test scenarios that exercise the whole system on each transaction basis from start to finish. This document describes comprehensive use case test scenarios for the Shop360 mobile app, covering all major user flows and transactions.

**Use Case Testing Strategy:**
- **Complete Transaction Flows**: Testing end-to-end user journeys from start to finish
- **Actor-Based Scenarios**: Different use cases for different user roles (Guest, User, Admin)
- **Positive and Negative Flows**: Both successful and error scenarios
- **Alternative Flows**: Variations in the main flow based on different conditions
- **Preconditions and Postconditions**: System state before and after each use case

---

## UC1: User Registration and Onboarding

### Use Case ID: UC1
### Use Case Name: User Registration and Onboarding
### Actor: Guest User
### Priority: High

### Description:
A new user registers for an account, verifies their email, selects an avatar, and completes onboarding to access the full app functionality.

### Preconditions:
- User is not logged in (Guest state)
- App is installed and running
- Internet connection is available
- User has a valid email address

### Main Flow:
1. User opens the app
2. User is presented with the Home screen (Guest mode)
3. User navigates to Profile tab
4. User taps "Sign Up" or "Login" button
5. User selects "Sign Up" option
6. User enters:
   - Full name (e.g., "John Doe")
   - Email address (e.g., "john@example.com")
   - Password (e.g., "SecurePass123!")
   - Confirms password
7. User taps "Sign Up" button
8. System validates input fields
9. System creates user account in Firebase Authentication
10. System sends verification email to user's email address
11. User is redirected to Email Verification screen
12. System displays message: "Please verify your email address"
13. User opens their email client
14. User clicks verification link in email
15. User returns to app
16. System detects email verification status
17. User is redirected to Avatar Welcome screen
18. User views avatar selection instructions
19. User taps "Choose Avatar" button
20. User is presented with avatar selection screen
21. User browses available avatars
22. User selects an avatar (e.g., "m1.png")
23. User confirms avatar selection
24. System saves avatar selection to user profile
25. User is redirected to Avatar Final Welcome screen
26. System displays welcome message with selected avatar
27. User taps "Get Started" button
28. User is redirected to Home screen (Authenticated state)
29. User can now access all authenticated features

### Alternative Flows:

**A1: Invalid Email Format**
- Step 6: User enters invalid email (e.g., "invalid-email")
- Step 7: System displays error: "Invalid email format"
- Flow returns to Step 6

**A2: Weak Password**
- Step 6: User enters weak password (e.g., "123")
- Step 7: System displays error: "Password must be at least 6 characters"
- Flow returns to Step 6

**A3: Email Already Registered**
- Step 8: System detects email already exists
- Step 9: System displays error: "Email already registered"
- Flow returns to Step 6

**A4: Email Verification Not Completed**
- Step 11: User closes app without verifying email
- Step 12: User reopens app later
- System redirects user to Email Verification screen
- User cannot proceed until email is verified

**A5: Network Error During Registration**
- Step 8: Network connection fails
- System displays error: "Network error. Please try again."
- Flow returns to Step 6

### Postconditions:
- User account is created in Firebase Authentication
- User email is verified
- User profile is created with selected avatar
- User is logged in and authenticated
- User can access all authenticated features
- User onboarding is complete

### Test Scenarios:

**TC-UC1.1: Successful Registration and Onboarding**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: User successfully registers, verifies email, selects avatar, and accesses authenticated features

**TC-UC1.2: Registration with Invalid Email**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 6, enter invalid email, continue
- **Expected Result**: System displays error message, registration fails

**TC-UC1.3: Registration with Weak Password**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 6, enter weak password, continue
- **Expected Result**: System displays error message, registration fails

**TC-UC1.4: Registration with Existing Email**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 8, use existing email
- **Expected Result**: System displays "Email already registered" error

**TC-UC1.5: Email Verification Timeout**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 11, close app, reopen after 24 hours
- **Expected Result**: User is still on verification screen, can request new verification email

---

## UC2: User Login

### Use Case ID: UC2
### Use Case Name: User Login
### Actor: Guest User (with existing account)
### Priority: High

### Description:
An existing user logs into their account to access authenticated features and personalized content.

### Preconditions:
- User has a registered account
- User's email is verified
- User is not currently logged in
- App is running

### Main Flow:
1. User opens the app
2. User is in Guest mode (Home screen)
3. User navigates to Profile tab
4. User taps "Login" or "Sign Up" button
5. User selects "Login" option
6. User is presented with Login screen
7. User enters:
   - Email address (e.g., "john@example.com")
   - Password (e.g., "SecurePass123!")
8. User taps "Sign In" button
9. System validates email format
10. System validates password is not empty
11. System authenticates user with Firebase
12. System checks email verification status
13. System loads user profile data
14. System checks if user has selected avatar
15. If avatar not selected: User is redirected to Avatar Welcome screen (see UC1)
16. If avatar selected: User is redirected to Welcome Back screen
17. User views welcome message
18. User taps "Continue" button
19. System migrates guest cart to authenticated cart (if applicable)
20. User is redirected to Home screen (Authenticated state)
21. User can access all authenticated features

### Alternative Flows:

**A1: Invalid Email Format**
- Step 7: User enters invalid email
- Step 8: System displays error: "Invalid email format"
- Flow returns to Step 7

**A2: Incorrect Password**
- Step 11: Firebase authentication fails (wrong password)
- System displays error: "Invalid email or password"
- Flow returns to Step 7

**A3: Email Not Verified**
- Step 12: System detects email not verified
- User is redirected to Email Verification screen
- User cannot proceed until email is verified

**A4: Account Not Found**
- Step 11: Firebase authentication fails (email not registered)
- System displays error: "Invalid email or password"
- Flow returns to Step 7

**A5: Network Error**
- Step 11: Network connection fails
- System displays error: "Network error. Please try again."
- Flow returns to Step 7

**A6: User Has No Avatar (First Login After Registration)**
- Step 14: System detects no avatar selected
- User is redirected to Avatar Welcome screen
- Flow continues with avatar selection (see UC1, Steps 18-28)

### Postconditions:
- User is authenticated and logged in
- User profile is loaded
- Guest cart is migrated to authenticated cart (if items exist)
- User can access authenticated features
- User session is active

### Test Scenarios:

**TC-UC2.1: Successful Login**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: User successfully logs in and accesses authenticated features

**TC-UC2.2: Login with Invalid Email**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 7, enter invalid email
- **Expected Result**: System displays error, login fails

**TC-UC2.3: Login with Incorrect Password**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 7, enter wrong password
- **Expected Result**: System displays "Invalid email or password" error

**TC-UC2.4: Login with Unverified Email**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 12, use unverified email
- **Expected Result**: User redirected to verification screen

**TC-UC2.5: Guest Cart Migration on Login**
- **Type**: Positive
- **Steps**: Add items to cart as guest, then execute Main Flow
- **Expected Result**: Guest cart items are migrated to authenticated cart

---

## UC3: Password Reset

### Use Case ID: UC3
### Use Case Name: Password Reset
### Actor: Guest User (with existing account)
### Priority: High

### Description:
A user who has forgotten their password requests a password reset link via email and successfully resets their password.

### Preconditions:
- User has a registered account
- User is not logged in
- User has access to their registered email

### Main Flow:
1. User opens the app
2. User navigates to Profile tab
3. User taps "Login" button
4. User is presented with Login screen
5. User taps "Forgot Password?" link
6. User is redirected to Forgot Password screen
7. User enters registered email address (e.g., "john@example.com")
8. User taps "Send Reset Link" button
9. System validates email format
10. System checks if email is registered
11. System sends password reset email via Firebase
12. System displays success message: "Password reset link sent to your email"
13. User opens their email client
14. User clicks password reset link in email
15. User is redirected to password reset page (web)
16. User enters new password (e.g., "NewSecurePass123!")
17. User confirms new password
18. User submits new password
19. System validates new password
20. System updates password in Firebase
21. System displays success message
22. User returns to app
23. User can now login with new password

### Alternative Flows:

**A1: Invalid Email Format**
- Step 7: User enters invalid email
- Step 8: System displays error: "Invalid email format"
- Flow returns to Step 7

**A2: Email Not Registered**
- Step 10: System detects email not registered
- System displays error: "Email not found"
- Flow returns to Step 7

**A3: Weak New Password**
- Step 16: User enters weak password
- Step 18: System displays error: "Password must be at least 6 characters"
- Flow returns to Step 16

**A4: Password Reset Link Expired**
- Step 14: User clicks expired reset link
- System displays error: "Reset link has expired"
- Flow returns to Step 6

**A5: Network Error**
- Step 11: Network connection fails
- System displays error: "Network error. Please try again."
- Flow returns to Step 7

### Postconditions:
- Password reset email is sent (if email is registered)
- User's password is updated (if reset link is used)
- User can login with new password

### Test Scenarios:

**TC-UC3.1: Successful Password Reset**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: User receives reset email, resets password, and can login

**TC-UC3.2: Password Reset with Invalid Email**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 7, enter invalid email
- **Expected Result**: System displays error message

**TC-UC3.3: Password Reset with Unregistered Email**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 10, use unregistered email
- **Expected Result**: System displays "Email not found" error

**TC-UC3.4: Password Reset with Weak Password**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 16, enter weak password
- **Expected Result**: System rejects weak password

---

## UC4: Browse and Search Products

### Use Case ID: UC4
### Use Case Name: Browse and Search Products
### Actor: Any User (Guest, Authenticated User, Admin)
### Priority: High

### Description:
A user browses the product catalog, views featured products, searches for specific products, and filters products by category.

### Preconditions:
- App is running
- Internet connection is available
- Products exist in the catalog

### Main Flow:
1. User opens the app
2. User is on Home screen
3. User views featured products section
4. User scrolls to view:
   - Featured Products
   - New Arrivals
   - Best Sellers
5. User taps on a product card
6. User is redirected to Product Details screen (see UC5)
7. User navigates back to Home
8. User taps "Products" tab
9. User is on Product List screen
10. User views all available products
11. User scrolls to browse more products
12. User taps search icon
13. User enters search query (e.g., "laptop")
14. System filters products matching search query
15. User views filtered search results
16. User taps filter icon
17. User selects a category from filter options
18. System filters products by selected category
19. User views filtered category results
20. User taps on a product from results
21. User is redirected to Product Details screen

### Alternative Flows:

**A1: No Search Results**
- Step 14: No products match search query
- System displays message: "No products found"
- User can clear search and try again

**A2: Empty Category**
- Step 18: Selected category has no products
- System displays message: "No products in this category"
- User can select different category

**A3: Network Error**
- Step 3: Network connection fails while loading products
- System displays error: "Failed to load products"
- User can retry

**A4: Clear Search**
- Step 15: User taps "Clear" or "X" button
- System clears search query
- All products are displayed again

**A5: Clear Filter**
- Step 19: User taps "Clear Filter" button
- System removes category filter
- All products are displayed again

### Postconditions:
- User has viewed product catalog
- Search results are displayed (if search was performed)
- Filtered results are displayed (if filter was applied)
- User can navigate to product details

### Test Scenarios:

**TC-UC4.1: Browse Featured Products**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-6
- **Expected Result**: User views featured products and can navigate to details

**TC-UC4.2: Search Products Successfully**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-15
- **Expected Result**: User searches and finds matching products

**TC-UC4.3: Filter Products by Category**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-19
- **Expected Result**: User filters products and views category results

**TC-UC4.4: Search with No Results**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 13, enter non-existent product name
- **Expected Result**: System displays "No products found" message

**TC-UC4.5: Filter Empty Category**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 17, select category with no products
- **Expected Result**: System displays "No products in this category" message

---

## UC5: View Product Details

### Use Case ID: UC5
### Use Case Name: View Product Details
### Actor: Any User (Guest, Authenticated User, Admin)
### Priority: High

### Description:
A user views detailed information about a product including images, description, price, stock availability, and can add it to cart or wishlist.

### Preconditions:
- User is on Home, Product List, or Search Results screen
- Product exists in catalog
- Product has valid data

### Main Flow:
1. User taps on a product card
2. User is redirected to Product Details screen
3. System loads product data from Firestore
4. User views:
   - Product images (swipeable gallery)
   - Product name
   - Product description
   - Current price
   - Original price (if discounted)
   - Discount percentage (if applicable)
   - Stock availability status
   - Product specifications
5. User scrolls to view more details
6. User views product reviews section (if available)
7. User can interact with:
   - Quantity selector (increase/decrease)
   - "Add to Cart" button
   - "Add to Wishlist" button (if authenticated)
   - "View in AR" button (if 3D model available)
8. User selects quantity (default: 1)
9. User taps "Add to Cart" button
10. System validates product stock availability
11. System adds product to cart (guest cart or authenticated cart)
12. System displays success message: "Added to cart"
13. User can continue shopping or view cart

### Alternative Flows:

**A1: Product Out of Stock**
- Step 10: System detects product stock is 0
- System displays error: "Product is out of stock"
- "Add to Cart" button is disabled
- User cannot add product to cart

**A2: Insufficient Stock**
- Step 8: User selects quantity greater than available stock
- Step 9: System displays warning: "Only X items available"
- System limits quantity to available stock
- User can proceed with limited quantity

**A3: Add to Wishlist (Authenticated User)**
- Step 7: User taps "Add to Wishlist" button
- System adds product to user's wishlist
- System displays success message: "Added to wishlist"
- Button changes to "Remove from Wishlist"

**A4: View in AR**
- Step 7: User taps "View in AR" button
- System requests camera permission (if not granted)
- User grants camera permission
- User is redirected to AR View screen (see UC15)

**A5: Product Not Found**
- Step 3: Product ID is invalid or product deleted
- System displays error: "Product not found"
- User is redirected back to previous screen

**A6: Network Error**
- Step 3: Network connection fails
- System displays error: "Failed to load product"
- User can retry

### Postconditions:
- Product details are displayed
- Product is added to cart (if user added it)
- Product is added to wishlist (if user added it)
- Cart count is updated (if product added)

### Test Scenarios:

**TC-UC5.1: View Product Details Successfully**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-6
- **Expected Result**: User views complete product information

**TC-UC5.2: Add Product to Cart**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Product is added to cart, success message displayed

**TC-UC5.3: Add Out of Stock Product**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 9, use out of stock product
- **Expected Result**: System prevents adding to cart, displays error

**TC-UC5.4: Add to Wishlist**
- **Type**: Positive
- **Steps**: Execute Main Flow until Step 7, tap "Add to Wishlist" (authenticated)
- **Expected Result**: Product added to wishlist

**TC-UC5.5: View Product with Insufficient Stock**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 8, select quantity > stock
- **Expected Result**: System limits quantity, displays warning

---

## UC6: Add Product to Cart (Guest)

### Use Case ID: UC6
### Use Case Name: Add Product to Cart (Guest)
### Actor: Guest User
### Priority: High

### Description:
A guest user (not logged in) adds products to their cart, which is stored locally. The cart can be migrated to authenticated cart upon login.

### Preconditions:
- User is not logged in (Guest state)
- User is on Product Details screen
- Product is in stock
- App has local storage access

### Main Flow:
1. User views product details (see UC5)
2. User selects quantity (default: 1)
3. User taps "Add to Cart" button
4. System validates product stock availability
5. System checks if product already exists in guest cart
6. If product exists: System updates quantity
7. If product doesn't exist: System adds new item to cart
8. System saves cart to local storage (AsyncStorage)
9. System displays success message: "Added to cart"
10. Cart icon badge updates with item count
11. User can continue shopping or view cart
12. User navigates to Cart tab
13. User views cart items
14. User can proceed to checkout (will be prompted to login)

### Alternative Flows:

**A1: Product Out of Stock**
- Step 4: System detects product stock is 0
- System displays error: "Product is out of stock"
- Product is not added to cart

**A2: Product Already in Cart**
- Step 5: Product already exists in cart
- Step 6: System increases quantity by selected amount
- If new quantity exceeds stock: System limits to available stock

**A3: Guest Cart Migration on Login**
- Step 11: User logs in (see UC2)
- System detects guest cart has items
- System merges guest cart with authenticated cart
- Guest cart items are added to Firestore cart
- Local guest cart is cleared
- User's cart now contains all items

**A4: Local Storage Full**
- Step 8: Local storage is full
- System displays error: "Cannot save cart item"
- User can try again or login to use cloud cart

### Postconditions:
- Product is added to guest cart (local storage)
- Cart count is updated
- Cart is accessible from Cart tab
- Cart can be migrated on login

### Test Scenarios:

**TC-UC6.1: Add Product to Guest Cart**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Product added to local cart, cart count updates

**TC-UC6.2: Update Quantity of Existing Item**
- **Type**: Positive
- **Steps**: Execute Main Flow, add same product again
- **Expected Result**: Quantity increases, not duplicate item

**TC-UC6.3: Guest Cart Migration on Login**
- **Type**: Positive
- **Steps**: Execute Main Flow, then login (UC2)
- **Expected Result**: Guest cart items migrated to authenticated cart

**TC-UC6.4: Add Out of Stock Product**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 4, use out of stock product
- **Expected Result**: System prevents adding, displays error

---

## UC7: Manage Shopping Cart

### Use Case ID: UC7
### Use Case Name: Manage Shopping Cart
### Actor: Authenticated User
### Priority: High

### Description:
An authenticated user views their cart, updates item quantities, removes items, and prepares for checkout.

### Preconditions:
- User is logged in and authenticated
- User has items in cart (or cart is empty)
- User is on Cart screen

### Main Flow:
1. User navigates to Cart tab
2. System loads cart items from Firestore
3. User views cart items with:
   - Product image
   - Product name
   - Price per unit
   - Quantity selector
   - Total price for item
   - Remove button
4. User views cart summary:
   - Subtotal
   - Shipping cost
   - Total amount
5. User updates quantity for an item:
   - User taps "+" to increase quantity
   - System validates stock availability
   - System updates quantity in Firestore
   - Cart total updates automatically
6. User removes an item:
   - User taps "Remove" button
   - System confirms removal
   - System removes item from Firestore cart
   - Cart total updates automatically
7. User reviews cart contents
8. User taps "Proceed to Checkout" button
9. System validates cart is not empty
10. User is redirected to Checkout screen (see UC8)

### Alternative Flows:

**A1: Empty Cart**
- Step 2: Cart has no items
- System displays message: "Your cart is empty"
- "Proceed to Checkout" button is disabled
- User can continue shopping

**A2: Item Out of Stock**
- Step 5: Product stock becomes 0 while in cart
- System displays warning: "Product is out of stock"
- Item is highlighted with error border
- User can remove item or wait for restock

**A3: Insufficient Stock for Quantity**
- Step 5: User tries to increase quantity beyond available stock
- System displays alert: "Only X items available"
- System limits quantity to available stock
- Quantity selector updates

**A4: Stock Decreased After Adding to Cart**
- Step 3: Product stock decreased after item was added
- System displays warning for affected items
- User can adjust quantity or remove item

**A5: Product Deleted**
- Step 2: Product was deleted from catalog
- System displays error: "Product no longer available"
- Item is removed from cart automatically
- Cart total updates

**A6: Network Error**
- Step 2: Network connection fails
- System displays error: "Failed to load cart"
- User can retry

### Postconditions:
- Cart items are displayed
- Quantities are updated (if changed)
- Items are removed (if deleted)
- Cart total is calculated correctly
- User can proceed to checkout (if cart not empty)

### Test Scenarios:

**TC-UC7.1: View Cart with Items**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-4
- **Expected Result**: User views all cart items and summary

**TC-UC7.2: Update Item Quantity**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-5
- **Expected Result**: Quantity updates, cart total recalculates

**TC-UC7.3: Remove Item from Cart**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-6
- **Expected Result**: Item removed, cart total updates

**TC-UC7.4: View Empty Cart**
- **Type**: Positive
- **Steps**: Execute Main Flow with empty cart
- **Expected Result**: Empty cart message displayed, checkout disabled

**TC-UC7.5: Update Quantity Beyond Stock**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 5, increase beyond stock
- **Expected Result**: System limits quantity, displays warning

---

## UC8: Checkout Process

### Use Case ID: UC8
### Use Case Name: Checkout Process
### Actor: Authenticated User
### Priority: High

### Description:
An authenticated user completes the checkout process by selecting shipping address, payment method, and placing an order.

### Preconditions:
- User is logged in and authenticated
- User has items in cart
- User is on Cart screen
- User has at least one shipping address (or can add one)

### Main Flow:
1. User is on Cart screen with items
2. User taps "Proceed to Checkout" button
3. User is redirected to Checkout screen
4. System loads user's saved addresses
5. System loads user's saved payment methods
6. User views checkout summary:
   - Cart items list
   - Subtotal
   - Shipping cost
   - Total amount
7. User selects shipping address:
   - If addresses exist: User selects from list
   - If no addresses: User taps "Add Address" button (see UC11)
8. User selects payment method:
   - Cash on Delivery
   - Card Payment
9. If Card Payment selected:
   - User selects saved card from list
   - Or user taps "Add New Card" (see UC12)
10. User reviews all checkout details
11. User taps "Place Order" button
12. System validates:
    - Address is selected
    - Payment method is selected
    - Card is selected (if card payment)
    - All items are still in stock
13. System creates order in Firestore
14. System deducts stock from products
15. System clears cart
16. System creates order timeline entry
17. User is redirected to Order Placed screen
18. System displays order confirmation with order ID
19. User can view order details or continue shopping

### Alternative Flows:

**A1: No Shipping Address**
- Step 7: User has no saved addresses
- User must add address before proceeding
- User is redirected to Add Address screen (see UC11)
- After adding address, user returns to checkout

**A2: No Payment Method for Card Payment**
- Step 9: User selects card payment but has no saved cards
- User must add card before proceeding
- User is redirected to Add Payment Card screen (see UC12)
- After adding card, user returns to checkout

**A3: Item Out of Stock During Checkout**
- Step 12: System detects item is out of stock
- System displays error: "Some items are out of stock"
- User is redirected back to Cart screen
- Out of stock items are removed from cart

**A4: Insufficient Stock for Quantity**
- Step 12: System detects quantity exceeds available stock
- System displays error: "Only X items available for [Product Name]"
- User is redirected back to Cart screen
- Quantity is adjusted to available stock

**A5: Invalid Card Selected**
- Step 9: Selected card has invalid details
- System displays error: "Invalid card details"
- User must select different card or add new one

**A6: Network Error During Order Placement**
- Step 13: Network connection fails
- System displays error: "Failed to place order. Please try again."
- Order is not created
- Cart remains unchanged
- User can retry

**A7: Transaction Failure (Stock Conflict)**
- Step 13: Another user purchased last item (race condition)
- System detects stock conflict in transaction
- System displays error: "Item no longer available"
- User is redirected to Cart screen
- Affected items are removed from cart

### Postconditions:
- Order is created in Firestore (if successful)
- Product stock is deducted
- Cart is cleared
- Order confirmation is displayed
- User receives order notification
- Admin is notified of new order

### Test Scenarios:

**TC-UC8.1: Successful Checkout with Cash on Delivery**
- **Type**: Positive
- **Steps**: Execute Main Flow with Cash on Delivery
- **Expected Result**: Order placed successfully, cart cleared, confirmation displayed

**TC-UC8.2: Successful Checkout with Card Payment**
- **Type**: Positive
- **Steps**: Execute Main Flow with Card Payment
- **Expected Result**: Order placed with card, cart cleared, confirmation displayed

**TC-UC8.3: Checkout with No Address**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 7, user has no addresses
- **Expected Result**: User must add address before proceeding

**TC-UC8.4: Checkout with Out of Stock Item**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 12, item becomes out of stock
- **Expected Result**: Error displayed, user redirected to cart

**TC-UC8.5: Checkout with Stock Conflict**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 13, race condition occurs
- **Expected Result**: Transaction fails, error displayed, cart updated

---

## UC9: View Order History

### Use Case ID: UC9
### Use Case Name: View Order History
### Actor: Authenticated User
### Priority: Medium

### Description:
An authenticated user views their order history, including past and current orders with their statuses.

### Preconditions:
- User is logged in and authenticated
- User has placed at least one order (or order history is empty)
- User is on Profile screen

### Main Flow:
1. User navigates to Profile tab
2. User views profile menu options
3. User taps "Orders" or "Order History" option
4. User is redirected to Order History screen
5. System loads user's orders from Firestore
6. System sorts orders by date (newest first)
7. User views list of orders with:
   - Order ID
   - Order date
   - Order status (Processing, Shipped, Delivered, Cancelled)
   - Total amount
   - Number of items
8. User scrolls to view more orders
9. User taps on an order
10. User is redirected to Order Detail screen (see UC10)

### Alternative Flows:

**A1: Empty Order History**
- Step 5: User has no orders
- System displays message: "You have no orders yet"
- User can continue shopping

**A2: Filter Orders by Status**
- Step 7: User taps filter option
- User selects status filter (e.g., "Processing", "Delivered")
- System filters orders by selected status
- User views filtered results

**A3: Network Error**
- Step 5: Network connection fails
- System displays error: "Failed to load orders"
- User can retry

**A4: Real-time Order Updates**
- Step 7: Order status changes (admin updates)
- System automatically updates order status in real-time
- User sees updated status without refresh

### Postconditions:
- Order history is displayed
- Orders are sorted by date
- User can view order details
- Order status updates in real-time

### Test Scenarios:

**TC-UC9.1: View Order History**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: User views all orders with details

**TC-UC9.2: View Empty Order History**
- **Type**: Positive
- **Steps**: Execute Main Flow with no orders
- **Expected Result**: Empty state message displayed

**TC-UC9.3: Filter Orders by Status**
- **Type**: Positive
- **Steps**: Execute Main Flow until Step 7, apply status filter
- **Expected Result**: Orders filtered by status

**TC-UC9.4: Real-time Order Status Update**
- **Type**: Positive
- **Steps**: Execute Main Flow, admin updates order status
- **Expected Result**: Order status updates automatically

---

## UC10: View Order Details and Track Order

### Use Case ID: UC10
### Use Case Name: View Order Details and Track Order
### Actor: Authenticated User
### Priority: Medium

### Description:
An authenticated user views detailed information about a specific order, including items, timeline, and tracking status.

### Preconditions:
- User is logged in and authenticated
- User is on Order History screen
- Order exists and belongs to user

### Main Flow:
1. User is on Order History screen
2. User taps on an order
3. User is redirected to Order Detail screen
4. System loads order details from Firestore
5. User views order information:
   - Order ID
   - Order date and time
   - Current status
   - Shipping address
   - Payment method
   - Order timeline (status history)
6. User views order items:
   - Product images
   - Product names
   - Quantities
   - Prices
   - Item totals
7. User views order summary:
   - Subtotal
   - Shipping cost
   - Total amount
8. User views order timeline:
   - Processing (Order placed)
   - Shipped (if applicable)
   - Delivered (if applicable)
   - Cancelled (if applicable)
9. If order is processing: User can request cancellation
10. User scrolls to view all details
11. User can navigate back to order history

### Alternative Flows:

**A1: Request Order Cancellation**
- Step 9: User taps "Cancel Order" button
- System displays confirmation dialog
- User confirms cancellation
- System creates cancellation request
- Order status changes to "Cancellation Requested"
- Admin is notified
- User sees updated status

**A2: Order Already Shipped**
- Step 9: Order status is "Shipped" or "Delivered"
- "Cancel Order" button is disabled
- User cannot cancel shipped/delivered orders

**A3: Order Already Cancelled**
- Step 5: Order status is "Cancelled"
- Order timeline shows cancellation entry
- "Cancel Order" button is not displayed

**A4: Network Error**
- Step 4: Network connection fails
- System displays error: "Failed to load order details"
- User can retry

**A5: Real-time Status Updates**
- Step 8: Admin updates order status
- System automatically updates timeline in real-time
- User sees new timeline entry without refresh

### Postconditions:
- Order details are displayed
- Order timeline is shown
- Cancellation can be requested (if applicable)
- Status updates are reflected in real-time

### Test Scenarios:

**TC-UC10.1: View Order Details**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: User views complete order information

**TC-UC10.2: Request Order Cancellation**
- **Type**: Positive
- **Steps**: Execute Main Flow until Step 9, request cancellation
- **Expected Result**: Cancellation requested, status updated

**TC-UC10.3: Cancel Shipped Order**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 9, order is shipped
- **Expected Result**: Cancel button disabled, cancellation not allowed

**TC-UC10.4: Real-time Status Update**
- **Type**: Positive
- **Steps**: Execute Main Flow, admin updates status
- **Expected Result**: Timeline updates automatically

---

## UC11: Manage Shipping Addresses

### Use Case ID: UC11
### Use Case Name: Manage Shipping Addresses
### Actor: Authenticated User
### Priority: Medium

### Description:
An authenticated user adds, edits, deletes, and sets default shipping addresses for order delivery.

### Preconditions:
- User is logged in and authenticated
- User is on Profile screen or Checkout screen

### Main Flow (Add Address):
1. User navigates to Profile tab
2. User taps "Shipping Addresses" option
3. User is redirected to Shipping Addresses screen
4. System loads user's saved addresses from Firestore
5. User views list of saved addresses
6. User taps "Add New Address" button
7. User is redirected to Address Form screen
8. User enters address details:
   - Full name
   - Street address
   - City
   - State/Province
   - ZIP/Postal code
   - Country
9. User can set as default address (toggle)
10. User taps "Save Address" button
11. System validates all required fields
12. System saves address to Firestore
13. System sets as default (if selected)
14. User is redirected back to Shipping Addresses screen
15. New address appears in list

### Alternative Flows:

**A1: Edit Existing Address**
- Step 5: User taps on an existing address
- User is redirected to Address Form with pre-filled data
- User modifies address details
- User taps "Save Address" button
- System updates address in Firestore
- User returns to address list

**A2: Delete Address**
- Step 5: User taps delete icon on an address
- System displays confirmation dialog
- User confirms deletion
- System deletes address from Firestore
- Address is removed from list
- If deleted address was default: System sets another address as default (if available)

**A3: Set Default Address**
- Step 5: User taps "Set as Default" on a non-default address
- System updates default address in Firestore
- Previous default address becomes non-default
- Selected address becomes default

**A4: Invalid Address Data**
- Step 11: System detects invalid or missing fields
- System displays error: "Please fill all required fields"
- User can correct and resubmit

**A5: Add Address from Checkout**
- Step 1: User is on Checkout screen with no addresses
- User taps "Add Address" button
- User completes address form
- User returns to Checkout screen
- New address is automatically selected

### Postconditions:
- Address is saved to Firestore (if added/edited)
- Address is deleted (if removed)
- Default address is updated (if changed)
- Address list is updated

### Test Scenarios:

**TC-UC11.1: Add New Address**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Address added successfully, appears in list

**TC-UC11.2: Edit Existing Address**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Address updated successfully

**TC-UC11.3: Delete Address**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2
- **Expected Result**: Address deleted, removed from list

**TC-UC11.4: Set Default Address**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A3
- **Expected Result**: Default address updated

**TC-UC11.5: Add Address with Invalid Data**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 11, submit invalid data
- **Expected Result**: Error displayed, address not saved

---

## UC12: Manage Payment Methods

### Use Case ID: UC12
### Use Case Name: Manage Payment Methods
### Actor: Authenticated User
### Priority: Medium

### Description:
An authenticated user adds, edits, deletes, and sets default payment cards for checkout.

### Preconditions:
- User is logged in and authenticated
- User is on Profile screen or Checkout screen

### Main Flow (Add Payment Card):
1. User navigates to Profile tab
2. User taps "Payment Methods" option
3. User is redirected to Payment Methods screen
4. System loads user's saved cards from Firestore
5. User views list of saved payment cards
6. User taps "Add New Card" button
7. User is redirected to Add Payment Card screen
8. User enters card details:
   - Cardholder name
   - Card number (16 digits)
   - Expiry month (MM)
   - Expiry year (YYYY)
   - CVV (3-4 digits)
9. User can set as default payment method (toggle)
10. User taps "Save Card" button
11. System validates:
    - Card number format (Luhn algorithm)
    - Expiry date (not expired)
    - CVV format
    - Cardholder name (not empty)
12. System saves card to Firestore (encrypted)
13. System sets as default (if selected)
14. User is redirected back to Payment Methods screen
15. New card appears in list

### Alternative Flows:

**A1: Edit Existing Card**
- Step 5: User taps on an existing card
- User is redirected to Add Payment Card screen with pre-filled data
- User modifies card details
- User taps "Save Card" button
- System updates card in Firestore
- User returns to card list

**A2: Delete Payment Card**
- Step 5: User taps delete icon on a card
- System displays confirmation dialog
- User confirms deletion
- System deletes card from Firestore
- Card is removed from list
- If deleted card was default: System sets another card as default (if available)

**A3: Set Default Payment Method**
- Step 5: User taps "Set as Default" on a non-default card
- System updates default payment method in Firestore
- Previous default card becomes non-default
- Selected card becomes default

**A4: Invalid Card Number**
- Step 11: System detects invalid card number format
- System displays error: "Invalid card number"
- User can correct and resubmit

**A5: Expired Card**
- Step 11: System detects card expiry date is in the past
- System displays error: "Card has expired"
- User must enter valid expiry date

**A6: Invalid CVV**
- Step 11: System detects invalid CVV format
- System displays error: "Invalid CVV"
- User can correct and resubmit

**A7: Add Card from Checkout**
- Step 1: User is on Checkout screen, selects card payment
- User has no saved cards
- User taps "Add New Card" button
- User completes card form
- User returns to Checkout screen
- New card is automatically selected

### Postconditions:
- Payment card is saved to Firestore (if added/edited)
- Payment card is deleted (if removed)
- Default payment method is updated (if changed)
- Card list is updated

### Test Scenarios:

**TC-UC12.1: Add New Payment Card**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Card added successfully, appears in list

**TC-UC12.2: Edit Existing Card**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Card updated successfully

**TC-UC12.3: Delete Payment Card**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2
- **Expected Result**: Card deleted, removed from list

**TC-UC12.4: Add Card with Invalid Number**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 11, enter invalid card number
- **Expected Result**: Error displayed, card not saved

**TC-UC12.5: Add Expired Card**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 11, enter expired date
- **Expected Result**: Error displayed, card not saved

---

## UC13: Wishlist Management

### Use Case ID: UC13
### Use Case Name: Wishlist Management
### Actor: Authenticated User
### Priority: Medium

### Description:
An authenticated user adds products to wishlist, views wishlist, removes items, and moves items to cart.

### Preconditions:
- User is logged in and authenticated
- User is on Product Details screen or Wishlist screen

### Main Flow (Add to Wishlist):
1. User views product details (see UC5)
2. User taps "Add to Wishlist" button
3. System checks if product is already in wishlist
4. If not in wishlist: System adds product to Firestore wishlist
5. System displays success message: "Added to wishlist"
6. Button changes to "Remove from Wishlist"
7. User navigates to Profile tab
8. User taps "Wishlist" option
9. User is redirected to Wishlist screen
10. System loads wishlist items from Firestore
11. User views wishlist products with:
    - Product image
    - Product name
    - Price
    - Stock status
12. User taps on a product
13. User is redirected to Product Details screen
14. User can add product to cart from wishlist

### Alternative Flows:

**A1: Remove from Wishlist**
- Step 2: Product is already in wishlist
- User taps "Remove from Wishlist" button
- System removes product from Firestore wishlist
- System displays message: "Removed from wishlist"
- Button changes to "Add to Wishlist"

**A2: Move to Cart from Wishlist**
- Step 11: User taps "Add to Cart" button on wishlist item
- System validates product stock
- System adds product to cart
- System displays success message: "Added to cart"
- Product remains in wishlist (user can remove manually)

**A3: Product Out of Stock in Wishlist**
- Step 11: Product becomes out of stock
- System displays "Out of Stock" badge
- "Add to Cart" button is disabled
- User can still view product details

**A4: Product Deleted from Catalog**
- Step 10: Product was deleted from catalog
- System displays "Product no longer available"
- Item is removed from wishlist automatically

**A5: Empty Wishlist**
- Step 10: User has no items in wishlist
- System displays message: "Your wishlist is empty"
- User can continue shopping

### Postconditions:
- Product is added to wishlist (if added)
- Product is removed from wishlist (if removed)
- Wishlist is updated
- User can move items to cart

### Test Scenarios:

**TC-UC13.1: Add Product to Wishlist**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Product added to wishlist, button updates

**TC-UC13.2: Remove Product from Wishlist**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Product removed, button updates

**TC-UC13.3: Move Product to Cart**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2
- **Expected Result**: Product added to cart from wishlist

**TC-UC13.4: View Empty Wishlist**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A5
- **Expected Result**: Empty state message displayed

---

## UC14: Support Tickets (Chat with Vendor)

### Use Case ID: UC14
### Use Case Name: Support Tickets (Chat with Vendor)
### Actor: Authenticated User
### Priority: Medium

### Description:
An authenticated user creates support tickets to chat with vendors/admin, views ticket history, and receives responses.

### Preconditions:
- User is logged in and authenticated
- User is on Profile screen

### Main Flow (Create Ticket):
1. User navigates to Profile tab
2. User taps "Help & Support" option
3. User is redirected to Help & Support screen
4. User taps "My Tickets" or "Contact Support" option
5. User is redirected to My Tickets screen
6. System loads user's tickets from Firestore
7. User views list of tickets with:
   - Ticket subject
   - Status (Open, In Progress, Resolved, Closed)
   - Last message date
   - Unread message indicator
8. User taps "Create New Ticket" button
9. User is redirected to ticket creation form
10. User enters:
    - Subject (e.g., "Product inquiry")
    - Message/Description
11. User taps "Submit Ticket" button
12. System validates required fields
13. System creates ticket in Firestore with status "Open"
14. System notifies admin of new ticket
15. User is redirected to ticket detail screen
16. User views ticket conversation
17. Admin responds to ticket
18. System sends notification to user
19. User views admin response in ticket
20. User can reply to ticket
21. System updates ticket status based on conversation

### Alternative Flows:

**A1: View Existing Ticket**
- Step 7: User taps on an existing ticket
- User is redirected to ticket detail screen
- User views full conversation history
- User can reply to ticket

**A2: Reply to Ticket**
- Step 19: User taps "Reply" button
- User enters reply message
- User taps "Send" button
- System adds message to ticket conversation
- System updates ticket status to "In Progress" (if was "Open")
- Admin is notified

**A3: Close Resolved Ticket**
- Step 7: Ticket status is "Resolved"
- User taps "Close Ticket" button
- System updates ticket status to "Closed"
- Ticket is archived

**A4: Empty Ticket List**
- Step 6: User has no tickets
- System displays message: "You have no tickets yet"
- User can create new ticket

**A5: Real-time Message Updates**
- Step 16: Admin sends message
- System updates ticket in real-time
- User sees new message without refresh
- Unread indicator appears

### Postconditions:
- Ticket is created (if new)
- Ticket conversation is updated (if replied)
- Ticket status is updated
- Admin is notified (if new message)
- User receives notification (if admin replies)

### Test Scenarios:

**TC-UC14.1: Create Support Ticket**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Ticket created, admin notified

**TC-UC14.2: Reply to Ticket**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2
- **Expected Result**: Reply added, status updated

**TC-UC14.3: View Ticket Conversation**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Full conversation displayed

**TC-UC14.4: Real-time Message Updates**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A5
- **Expected Result**: New messages appear automatically

---

## UC15: AR Product Preview

### Use Case ID: UC15
### Use Case Name: AR Product Preview
### Actor: Any User (Guest, Authenticated User, Admin)
### Priority: Medium

### Description:
A user views a product in augmented reality, places the 3D model in their environment, and interacts with it using AR controls.

### Preconditions:
- User is on Product Details screen
- Product has 3D model available
- Device has camera
- App has camera permission (or can request it)

### Main Flow:
1. User views product details (see UC5)
2. User taps "View in AR" button
3. System checks camera permission status
4. If permission not granted: System requests camera permission
5. User grants camera permission
6. User is redirected to AR View screen
7. System initializes AR session
8. System loads 3D model for product
9. System detects horizontal planes in environment
10. User views camera feed with AR overlay
11. System displays plane detection indicators
12. User moves device to scan environment
13. System detects suitable plane
14. System displays placement indicator
15. User taps on detected plane
16. System places 3D model on plane
17. User views product model in AR environment
18. User interacts with model:
    - Pinch to scale (zoom in/out)
    - Rotate with two fingers
    - Drag to reposition
19. User taps "Reset" button to reset model position
20. User taps "Close" or back button
21. User returns to Product Details screen

### Alternative Flows:

**A1: Camera Permission Denied**
- Step 4: User denies camera permission
- System displays error: "Camera permission is required for AR view"
- System provides link to app settings
- User cannot access AR view
- User returns to Product Details screen

**A2: No 3D Model Available**
- Step 2: Product has no 3D model
- "View in AR" button is disabled or not displayed
- User cannot access AR view

**A3: Plane Detection Failed**
- Step 9: System cannot detect suitable planes
- System displays message: "Move device to detect surfaces"
- User continues scanning
- After timeout: System displays error: "Could not detect surface"

**A4: Model Loading Failed**
- Step 8: 3D model fails to load
- System displays error: "Failed to load 3D model"
- User can retry or return to product details

**A5: AR Tracking Lost**
- Step 17: AR tracking is lost during use
- System displays warning: "Tracking lost. Please move device slowly."
- System attempts to recover tracking
- If recovery fails: User must restart AR session

**A6: Device Not AR Compatible**
- Step 7: Device does not support AR
- System displays error: "AR not supported on this device"
- User returns to Product Details screen

### Postconditions:
- AR session is initialized (if successful)
- 3D model is placed in AR environment (if successful)
- User can interact with model
- AR session is closed when user exits

### Test Scenarios:

**TC-UC15.1: Successful AR Product Preview**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: AR view opens, model placed, user can interact

**TC-UC15.2: AR with Camera Permission Denied**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 4, deny permission
- **Expected Result**: Error displayed, AR view not accessible

**TC-UC15.3: AR with No Plane Detection**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 9, no planes detected
- **Expected Result**: Error message displayed, user can retry

**TC-UC15.4: AR Model Interaction**
- **Type**: Positive
- **Steps**: Execute Main Flow until Step 18, interact with model
- **Expected Result**: Model scales, rotates, and repositions correctly

---

## UC16: Admin Dashboard Access

### Use Case ID: UC16
### Use Case Name: Admin Dashboard Access
### Actor: Admin User
### Priority: High

### Description:
An admin user accesses the admin dashboard to view statistics, recent users, recent orders, and navigate to admin features.

### Preconditions:
- User is logged in and authenticated
- User has admin role
- App is running

### Main Flow:
1. Admin user logs in (see UC2)
2. System detects user has admin role
3. System redirects admin to Admin Dashboard (instead of regular Home)
4. Admin views dashboard with:
   - Total users count
   - Total products count
   - Total orders count
   - Recent orders list
   - Recent users list
   - Revenue statistics (if applicable)
5. Admin views recent orders with:
   - Order ID
   - Customer name
   - Order date
   - Order status
   - Total amount
6. Admin views recent users with:
   - User name
   - Email
   - Registration date
   - User role
7. Admin can navigate to:
   - Users management (see UC17)
   - Products management (see UC18)
   - Orders management (see UC19)
   - Categories management (see UC20)
   - Inquiries management (see UC21)
8. Admin taps on a recent order
9. Admin is redirected to Order Detail screen (admin view)
10. Admin can perform admin actions on order

### Alternative Flows:

**A1: Non-Admin User Attempts Access**
- Step 2: User does not have admin role
- System redirects to regular Home screen
- Admin dashboard is not accessible
- If user manually navigates to admin route: System displays "Not authorized" message

**A2: Real-time Statistics Updates**
- Step 4: New order is placed
- System automatically updates statistics in real-time
- Recent orders list updates
- Admin sees changes without refresh

**A3: Network Error**
- Step 4: Network connection fails
- System displays error: "Failed to load dashboard data"
- Admin can retry

**A4: Empty Statistics**
- Step 4: No users, products, or orders exist
- System displays "0" for counts
- Lists show empty state messages

### Postconditions:
- Admin dashboard is displayed
- Statistics are shown
- Recent data is listed
- Admin can navigate to management screens

### Test Scenarios:

**TC-UC16.1: Admin Accesses Dashboard**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Admin views dashboard with statistics

**TC-UC16.2: Non-Admin Attempts Access**
- **Type**: Negative
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Access denied, redirected to regular home

**TC-UC16.3: Real-time Statistics Updates**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2
- **Expected Result**: Statistics update automatically

---

## UC17: Admin User Management

### Use Case ID: UC17
### Use Case Name: Admin User Management
### Actor: Admin User
### Priority: High

### Description:
An admin user views all users, views user details, updates user roles, and manages user information.

### Preconditions:
- User is logged in as admin
- Admin is on Admin Dashboard

### Main Flow (View Users):
1. Admin navigates to Admin Dashboard
2. Admin taps "Users" tab
3. Admin is redirected to Admin Users screen
4. System loads all users from Firestore
5. Admin views list of users with:
   - User name
   - Email address
   - Registration date
   - User role (User, Admin)
   - Account status
6. Admin scrolls to view more users
7. Admin can search users by name or email
8. Admin taps on a user
9. Admin is redirected to User Detail screen
10. Admin views detailed user information:
    - Personal information
    - Order history
    - Addresses
    - Support tickets
    - Account activity
11. Admin can update user role
12. Admin taps "Update Role" button
13. System updates user role in Firestore
14. System displays success message
15. User's access permissions are updated

### Alternative Flows:

**A1: Search Users**
- Step 7: Admin enters search query
- System filters users matching query
- Admin views filtered results

**A2: Update User Role to Admin**
- Step 11: Admin selects "Admin" role
- Step 13: System updates role
- User gains admin access
- User can access admin dashboard

**A3: Update User Role to Regular User**
- Step 11: Admin selects "User" role
- Step 13: System updates role
- User loses admin access
- User is redirected to regular home (if logged in)

**A4: View User Orders**
- Step 10: Admin taps "View Orders" for user
- Admin views user's order history
- Admin can manage user's orders

**A5: View User Tickets**
- Step 10: Admin taps "View Tickets" for user
- Admin views user's support tickets
- Admin can respond to tickets

### Postconditions:
- User list is displayed
- User details are shown
- User role is updated (if changed)
- User permissions are updated

### Test Scenarios:

**TC-UC17.1: View All Users**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-6
- **Expected Result**: Admin views complete user list

**TC-UC17.2: View User Details**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Admin views detailed user information

**TC-UC17.3: Update User Role**
- **Type**: Positive
- **Steps**: Execute Main Flow until Step 12, update role
- **Expected Result**: User role updated, permissions changed

**TC-UC17.4: Search Users**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Users filtered by search query

---

## UC18: Admin Product Management

### Use Case ID: UC18
### Use Case Name: Admin Product Management
### Actor: Admin User
### Priority: High

### Description:
An admin user views all products, creates new products, edits existing products, deletes products, and manages product stock and categories.

### Preconditions:
- User is logged in as admin
- Admin is on Admin Dashboard

### Main Flow (Create Product):
1. Admin navigates to Admin Dashboard
2. Admin taps "Products" tab
3. Admin is redirected to Admin Products screen
4. System loads all products from Firestore
5. Admin views list of products with:
   - Product image
   - Product name
   - Price
   - Stock quantity
   - Category
   - Status (Active/Inactive)
6. Admin taps "Add New Product" button
7. Admin is redirected to Product Edit screen
8. Admin enters product details:
   - Product name
   - Description
   - Price
   - Stock quantity
   - Category
   - Product images (multiple)
   - 3D model URL (optional, for AR)
   - Discount percentage (optional)
9. Admin uploads product images
10. Admin taps "Save Product" button
11. System validates all required fields
12. System uploads images to Firebase Storage
13. System creates product in Firestore
14. Admin is redirected back to Products screen
15. New product appears in list

### Alternative Flows:

**A1: Edit Existing Product**
- Step 5: Admin taps on an existing product
- Admin is redirected to Product Edit screen with pre-filled data
- Admin modifies product details
- Admin taps "Save Product" button
- System updates product in Firestore
- Product changes are reflected immediately

**A2: Delete Product**
- Step 5: Admin taps delete icon on a product
- System displays confirmation dialog
- Admin confirms deletion
- System checks if product has active orders
- If no active orders: System deletes product from Firestore
- If has active orders: System displays error: "Cannot delete product with active orders"
- Product is removed from list (if deleted)

**A3: Update Product Stock**
- Step 5: Admin taps on product
- Admin modifies stock quantity
- Admin taps "Save Product" button
- System updates stock in Firestore
- Stock changes are reflected in real-time for users

**A4: Manage Product Categories**
- Step 5: Admin taps "Categories" option
- Admin is redirected to Categories screen
- Admin can add, edit, or delete categories
- Category changes affect product filtering

**A5: Upload Product Images**
- Step 9: Admin selects images from device
- System uploads images to Firebase Storage
- System displays upload progress
- Images are associated with product

**A6: Invalid Product Data**
- Step 11: System detects invalid or missing fields
- System displays error: "Please fill all required fields"
- Admin can correct and resubmit

### Postconditions:
- Product is created in Firestore (if new)
- Product is updated in Firestore (if edited)
- Product is deleted (if removed)
- Product stock is updated (if changed)
- Product images are uploaded to Storage
- Product changes are reflected in real-time

### Test Scenarios:

**TC-UC18.1: Create New Product**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Product created successfully, appears in list

**TC-UC18.2: Edit Existing Product**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Product updated successfully

**TC-UC18.3: Delete Product**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2
- **Expected Result**: Product deleted (if no active orders)

**TC-UC18.4: Update Product Stock**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A3
- **Expected Result**: Stock updated, reflected in real-time

**TC-UC18.5: Create Product with Invalid Data**
- **Type**: Negative
- **Steps**: Execute Main Flow until Step 11, submit invalid data
- **Expected Result**: Error displayed, product not saved

---

## UC19: Admin Order Management

### Use Case ID: UC19
### Use Case Name: Admin Order Management
### Actor: Admin User
### Priority: High

### Description:
An admin user views all orders, views order details, updates order status, and manages order cancellations.

### Preconditions:
- User is logged in as admin
- Admin is on Admin Dashboard

### Main Flow (View Orders):
1. Admin navigates to Admin Dashboard
2. Admin taps "Orders" tab
3. Admin is redirected to Admin Orders screen
4. System loads all orders from Firestore
5. Admin views list of orders with:
   - Order ID
   - Customer name
   - Order date
   - Order status (Processing, Shipped, Delivered, Cancelled)
   - Total amount
   - Item count
6. Admin can filter orders by status
7. Admin can search orders by order ID or customer name
8. Admin taps on an order
9. Admin is redirected to Order Detail screen (admin view)
10. Admin views detailed order information:
    - Customer details
    - Shipping address
    - Payment method
    - Order items
    - Order timeline
    - Order status history
11. Admin can update order status
12. Admin selects new status (e.g., "Shipped")
13. Admin taps "Update Status" button
14. System validates status transition
15. System updates order status in Firestore
16. System adds timeline entry
17. System sends notification to customer
18. Order status updates in real-time

### Alternative Flows:

**A1: Update Order to Shipped**
- Step 12: Admin selects "Shipped" status
- Step 15: System updates status
- System adds shipping date to timeline
- Customer receives shipping notification

**A2: Update Order to Delivered**
- Step 12: Admin selects "Delivered" status
- Step 15: System updates status
- System adds delivery date to timeline
- Customer receives delivery notification
- Order is marked as complete

**A3: Approve Order Cancellation**
- Step 10: Order has "Cancellation Requested" status
- Admin taps "Approve Cancellation" button
- System displays confirmation dialog
- Admin confirms approval
- System updates order status to "Cancelled"
- System restores product stock
- System adds cancellation entry to timeline
- Customer receives cancellation notification

**A4: Reject Order Cancellation**
- Step 10: Order has "Cancellation Requested" status
- Admin taps "Reject Cancellation" button
- Admin enters rejection reason
- System updates order status back to "Processing"
- System adds rejection entry to timeline
- Customer receives rejection notification

**A5: Filter Orders by Status**
- Step 6: Admin selects status filter
- System filters orders by selected status
- Admin views filtered results

**A6: Search Orders**
- Step 7: Admin enters search query
- System searches orders by ID or customer name
- Admin views search results

**A7: Cannot Cancel Shipped Order**
- Step 10: Order status is "Shipped" or "Delivered"
- "Approve Cancellation" button is disabled
- Admin cannot cancel shipped/delivered orders

### Postconditions:
- Order list is displayed
- Order details are shown
- Order status is updated (if changed)
- Order timeline is updated
- Customer is notified (if status changed)
- Product stock is restored (if cancelled)

### Test Scenarios:

**TC-UC19.1: View All Orders**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-9
- **Expected Result**: Admin views complete order list

**TC-UC19.2: Update Order Status**
- **Type**: Positive
- **Steps**: Execute Main Flow until Step 13, update status
- **Expected Result**: Status updated, timeline updated, customer notified

**TC-UC19.3: Approve Order Cancellation**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A3
- **Expected Result**: Cancellation approved, stock restored

**TC-UC19.4: Reject Order Cancellation**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A4
- **Expected Result**: Cancellation rejected, order continues

**TC-UC19.5: Filter Orders by Status**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A5
- **Expected Result**: Orders filtered by status

---

## UC20: Admin Category Management

### Use Case ID: UC20
### Use Case Name: Admin Category Management
### Actor: Admin User
### Priority: Medium

### Description:
An admin user views all product categories, creates new categories, edits categories, and deletes categories.

### Preconditions:
- User is logged in as admin
- Admin is on Admin Dashboard or Admin Products screen

### Main Flow (Create Category):
1. Admin navigates to Admin Products screen
2. Admin taps "Categories" option
3. Admin is redirected to Categories screen
4. System loads all categories from Firestore
5. Admin views list of categories with:
   - Category name
   - Category description
   - Number of products in category
   - Category icon/image
6. Admin taps "Add New Category" button
7. Admin is redirected to Category Form screen
8. Admin enters category details:
   - Category name
   - Category description
   - Category icon (optional)
9. Admin taps "Save Category" button
10. System validates required fields
11. System creates category in Firestore
12. Admin is redirected back to Categories screen
13. New category appears in list
14. Category is available for product assignment

### Alternative Flows:

**A1: Edit Existing Category**
- Step 5: Admin taps on an existing category
- Admin is redirected to Category Form with pre-filled data
- Admin modifies category details
- Admin taps "Save Category" button
- System updates category in Firestore
- Category changes affect all products in category

**A2: Delete Category**
- Step 5: Admin taps delete icon on a category
- System displays confirmation dialog
- System checks if category has products
- If no products: System deletes category
- If has products: System displays error: "Cannot delete category with products"
- Category is removed from list (if deleted)

**A3: Category Already Exists**
- Step 10: System detects category name already exists
- System displays error: "Category name already exists"
- Admin must use different name

**A4: Invalid Category Data**
- Step 10: System detects invalid or missing fields
- System displays error: "Please fill all required fields"
- Admin can correct and resubmit

### Postconditions:
- Category is created in Firestore (if new)
- Category is updated in Firestore (if edited)
- Category is deleted (if removed)
- Category is available for product assignment
- Product filtering is updated

### Test Scenarios:

**TC-UC20.1: Create New Category**
- **Type**: Positive
- **Steps**: Execute Main Flow
- **Expected Result**: Category created successfully, available for products

**TC-UC20.2: Edit Existing Category**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Category updated successfully

**TC-UC20.3: Delete Empty Category**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2 with no products
- **Expected Result**: Category deleted successfully

**TC-UC20.4: Delete Category with Products**
- **Type**: Negative
- **Steps**: Execute Alternative Flow A2 with products
- **Expected Result**: Error displayed, category not deleted

---

## UC21: Admin Inquiry Management

### Use Case ID: UC21
### Use Case Name: Admin Inquiry Management
### Actor: Admin User
### Priority: Medium

### Description:
An admin user views all support tickets/inquiries, responds to tickets, updates ticket status, and manages customer support.

### Preconditions:
- User is logged in as admin
- Admin is on Admin Dashboard

### Main Flow (View Inquiries):
1. Admin navigates to Admin Dashboard
2. Admin taps "Inquiries" or "Support Tickets" option
3. Admin is redirected to Admin Inquiries screen
4. System loads all tickets from Firestore
5. Admin views list of tickets with:
   - Ticket subject
   - Customer name
   - Ticket status (Open, In Progress, Resolved, Closed)
   - Created date
   - Last message date
   - Unread message indicator
6. Admin can filter tickets by status
7. Admin can search tickets by subject or customer name
8. Admin taps on a ticket
9. Admin is redirected to Ticket Detail screen
10. Admin views ticket conversation:
    - Customer's initial message
    - All replies and responses
    - Timestamps for each message
    - Ticket status history
11. Admin can respond to ticket
12. Admin enters reply message
13. Admin taps "Send Reply" button
14. System validates message is not empty
15. System adds reply to ticket conversation
16. System updates ticket status to "In Progress" (if was "Open")
17. System sends notification to customer
18. Ticket conversation updates in real-time

### Alternative Flows:

**A1: Update Ticket Status**
- Step 10: Admin taps "Update Status" button
- Admin selects new status (e.g., "Resolved")
- System updates ticket status in Firestore
- System adds status change entry to ticket
- Customer receives status update notification

**A2: Close Resolved Ticket**
- Step 10: Ticket status is "Resolved"
- Admin taps "Close Ticket" button
- System updates ticket status to "Closed"
- Ticket is archived
- Customer receives closure notification

**A3: Filter Tickets by Status**
- Step 6: Admin selects status filter
- System filters tickets by selected status
- Admin views filtered results

**A4: Search Tickets**
- Step 7: Admin enters search query
- System searches tickets by subject or customer
- Admin views search results

**A5: Real-time Ticket Updates**
- Step 10: Customer sends new message
- System updates ticket in real-time
- Admin sees new message without refresh
- Unread indicator appears

**A6: Empty Ticket List**
- Step 4: No tickets exist
- System displays message: "No inquiries yet"
- Admin can wait for new tickets

### Postconditions:
- Ticket list is displayed
- Ticket conversation is shown
- Ticket reply is sent (if responded)
- Ticket status is updated (if changed)
- Customer is notified (if replied or status changed)
- Ticket updates in real-time

### Test Scenarios:

**TC-UC21.1: View All Inquiries**
- **Type**: Positive
- **Steps**: Execute Main Flow Steps 1-10
- **Expected Result**: Admin views all support tickets

**TC-UC21.2: Respond to Ticket**
- **Type**: Positive
- **Steps**: Execute Main Flow until Step 13, send reply
- **Expected Result**: Reply sent, status updated, customer notified

**TC-UC21.3: Update Ticket Status**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A1
- **Expected Result**: Status updated, customer notified

**TC-UC21.4: Close Resolved Ticket**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A2
- **Expected Result**: Ticket closed, archived

**TC-UC21.5: Real-time Ticket Updates**
- **Type**: Positive
- **Steps**: Execute Alternative Flow A5
- **Expected Result**: New messages appear automatically

---

## Summary

This document covers comprehensive use case testing scenarios for the Shop360 mobile app, including:

### User Use Cases (UC1-UC15):
1. **User Registration and Onboarding** - Complete registration flow with email verification and avatar selection
2. **User Login** - Authentication and session management
3. **Password Reset** - Password recovery flow
4. **Browse and Search Products** - Product discovery and filtering
5. **View Product Details** - Product information and interactions
6. **Add Product to Cart (Guest)** - Guest shopping functionality
7. **Manage Shopping Cart** - Cart management and updates
8. **Checkout Process** - Complete order placement flow
9. **View Order History** - Order listing and tracking
10. **View Order Details and Track Order** - Detailed order information
11. **Manage Shipping Addresses** - Address CRUD operations
12. **Manage Payment Methods** - Payment card management
13. **Wishlist Management** - Wishlist operations
14. **Support Tickets (Chat with Vendor)** - Customer support system
15. **AR Product Preview** - Augmented reality product viewing

### Admin Use Cases (UC16-UC21):
16. **Admin Dashboard Access** - Admin portal and statistics
17. **Admin User Management** - User administration
18. **Admin Product Management** - Product CRUD operations
19. **Admin Order Management** - Order processing and status updates
20. **Admin Category Management** - Category administration
21. **Admin Inquiry Management** - Support ticket management

### Use Case Testing Coverage:
- **21 Complete Use Cases** covering all major transactions
- **Main Flows** for successful scenarios
- **Alternative Flows** for variations and error handling
- **Preconditions and Postconditions** for each use case
- **Test Scenarios** (Positive and Negative) for each use case
- **End-to-End Transaction Testing** from start to finish
- **Role-Based Scenarios** (Guest, User, Admin)

### Testing Strategy:
1. **Complete Transaction Flows**: Each use case tests the entire transaction from start to finish
2. **Actor-Based Testing**: Different scenarios for different user roles
3. **Positive and Negative Flows**: Both successful and error scenarios
4. **Alternative Paths**: Variations based on different conditions
5. **Real-time Updates**: Testing Firestore real-time synchronization
6. **Error Handling**: Network errors, validation errors, business rule violations

This comprehensive use case testing documentation ensures that all major user journeys and system transactions are thoroughly tested, providing complete coverage of the Shop360 mobile app functionality.