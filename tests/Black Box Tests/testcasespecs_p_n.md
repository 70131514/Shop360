# Shop360 Mobile App - Test Case Specifications

## Functional Requirements

### FR1: User Authentication
- FR1.1: Email/Password Sign Up
- FR1.2: Email/Password Sign In
- FR1.3: Google Sign In
- FR1.4: Email Verification
- FR1.5: Password Reset
- FR1.6: Sign Out

### FR2: User Profile Management
- FR2.1: View Personal Information
- FR2.2: Update Name
- FR2.3: Change Email Address
- FR2.4: Change Password
- FR2.5: Avatar Selection
- FR2.6: Avatar Onboarding

### FR3: Product Catalog
- FR3.1: Browse Products
- FR3.2: View Product Details
- FR3.3: Search Products
- FR3.4: Filter by Category
- FR3.5: View Featured Products
- FR3.6: View New Arrivals
- FR3.7: View Best Sellers

### FR4: Shopping Cart
- FR4.1: Add Product to Cart
- FR4.2: Update Cart Item Quantity
- FR4.3: Remove Item from Cart
- FR4.4: View Cart
- FR4.5: Guest Cart Functionality
- FR4.6: Cart Migration on Login

### FR5: Wishlist Management
- FR5.1: Add Product to Wishlist
- FR5.2: Remove Product from Wishlist
- FR5.3: View Wishlist
- FR5.4: Move from Wishlist to Cart

### FR6: Checkout Process
- FR6.1: Select Shipping Address
- FR6.2: Select Payment Method
- FR6.3: Place Order
- FR6.4: View Order Confirmation

### FR7: Order Management
- FR7.1: View Order History
- FR7.2: View Order Details
- FR7.3: Request Order Cancellation
- FR7.4: Track Order Status

### FR8: Address Management
- FR8.1: Add Shipping Address
- FR8.2: Edit Shipping Address
- FR8.3: Delete Shipping Address
- FR8.4: Set Default Address

### FR9: Payment Method Management
- FR9.1: Add Payment Card
- FR9.2: Edit Payment Card
- FR9.3: Delete Payment Card
- FR9.4: Set Default Payment Method

### FR10: AR View
- FR10.1: Access AR View
- FR10.2: Camera Permission Handling
- FR10.3: 3D Model Placement
- FR10.4: AR Controls (Scale, Rotate, Reset)

### FR11: Admin Dashboard
- FR11.1: View Dashboard Statistics
- FR11.2: View Recent Users
- FR11.3: View Recent Orders
- FR11.4: Access Admin Features

### FR12: Admin Product Management
- FR12.1: View All Products
- FR12.2: Create New Product
- FR12.3: Edit Product
- FR12.4: Delete Product
- FR12.5: Manage Product Stock
- FR12.6: Manage Product Categories

### FR13: Admin Order Management
- FR13.1: View All Orders
- FR13.2: View Order Details
- FR13.3: Update Order Status
- FR13.4: Approve Order Cancellation
- FR13.5: Reject Order Cancellation

### FR14: Admin User Management
- FR14.1: View All Users
- FR14.2: View User Details
- FR14.3: Update User Role
- FR14.4: View User Addresses
- FR14.5: View User Tickets

### FR15: Admin Category Management
- FR15.1: View Categories
- FR15.2: Create Category
- FR15.3: Edit Category
- FR15.4: Delete Category

### FR16: Support Tickets
- FR16.1: Submit Support Ticket
- FR16.2: View My Tickets
- FR16.3: Track Ticket Status

### FR17: Admin Inquiry Management
- FR17.1: View All Inquiries
- FR17.2: View Inquiry Details
- FR17.3: Update Inquiry Status
- FR17.4: Mark Inquiry as Viewed

### FR18: Settings
- FR18.1: Change Theme (Light/Dark)
- FR18.2: Adjust Font Size
- FR18.3: View Privacy Policy
- FR18.4: View Terms of Service

### FR19: Notifications
- FR19.1: View Notifications
- FR19.2: Mark Notifications as Read

## Non-Functional Requirements

### NFR1: Performance
- NFR1.1: App should load within 3 seconds
- NFR1.2: Real-time data updates should reflect within 2 seconds
- NFR1.3: AR view should initialize within 5 seconds

### NFR2: Security
- NFR2.1: Email verification required for authenticated features
- NFR2.2: Role-based access control for admin features
- NFR2.3: Secure authentication with Firebase
- NFR2.4: Secure data storage in Firestore

### NFR3: Usability
- NFR3.1: Intuitive navigation
- NFR3.2: Responsive UI design
- NFR3.3: Clear error messages
- NFR3.4: Accessible interface

### NFR4: Reliability
- NFR4.1: Error handling for network failures
- NFR4.2: Guest cart persistence in local storage
- NFR4.3: Transaction-based stock management
- NFR4.4: Data consistency across operations

### NFR5: Compatibility
- NFR5.1: Support for iOS devices
- NFR5.2: Support for Android devices
- NFR5.3: Support for different screen sizes

---

## Test Cases

### TC-FR1.1-POS-001: Successful Email/Password Sign Up
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.1-POS-001
- **Priority**: High
- **Description**: Verify user can successfully sign up with valid email and password
- **Reference**: FR1.1
- **Users**: Guest User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User is on Login/Signup screen
  - C. User has a valid email address not already registered
- **Steps**: 
  - A. Navigate to Signup screen
  - B. Enter valid email address (e.g., testuser@example.com)
  - C. Enter valid password (minimum 6 characters)
  - D. Enter name
  - E. Tap "Sign Up" button
- **Input**: Email: testuser@example.com, Password: Test123!, Name: Test User
- **Expected Result**: User account is created, verification email is sent, user is redirected to email verification screen
- **Status**: Not Tested

### TC-FR1.1-NEG-001: Sign Up with Invalid Email Format
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.1-NEG-001
- **Priority**: High
- **Description**: Verify system rejects sign up with invalid email format
- **Reference**: FR1.1
- **Users**: Guest User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User is on Signup screen
- **Steps**: 
  - A. Navigate to Signup screen
  - B. Enter invalid email address (e.g., invalidemail)
  - C. Enter valid password
  - D. Enter name
  - E. Tap "Sign Up" button
- **Input**: Email: invalidemail, Password: Test123!, Name: Test User
- **Expected Result**: Error message displayed indicating invalid email format, sign up fails
- **Status**: Not Tested

### TC-FR1.2-POS-001: Successful Email/Password Sign In
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.2-POS-001
- **Priority**: High
- **Description**: Verify user can successfully sign in with valid credentials
- **Reference**: FR1.2
- **Users**: Registered User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User has registered account with verified email
  - C. User is on Login screen
- **Steps**: 
  - A. Navigate to Login screen
  - B. Enter registered email address
  - C. Enter correct password
  - D. Tap "Sign In" button
- **Input**: Email: testuser@example.com, Password: Test123!
- **Expected Result**: User is successfully signed in and redirected to Home screen
- **Status**: Not Tested

### TC-FR1.2-NEG-001: Sign In with Incorrect Password
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.2-NEG-001
- **Priority**: High
- **Description**: Verify system rejects sign in with incorrect password
- **Reference**: FR1.2
- **Users**: Registered User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User has registered account
  - C. User is on Login screen
- **Steps**: 
  - A. Navigate to Login screen
  - B. Enter registered email address
  - C. Enter incorrect password
  - D. Tap "Sign In" button
- **Input**: Email: testuser@example.com, Password: WrongPass123!
- **Expected Result**: Error message displayed indicating invalid credentials, sign in fails
- **Status**: Not Tested

### TC-FR1.3-POS-001: Successful Google Sign In
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.3-POS-001
- **Priority**: High
- **Description**: Verify user can successfully sign in with Google account
- **Reference**: FR1.3
- **Users**: Guest User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User has Google account
  - C. User is on Login screen
  - D. Google Play Services available (Android)
- **Steps**: 
  - A. Navigate to Login screen
  - B. Tap "Sign in with Google" button
  - C. Select Google account from account picker
  - D. Grant permissions if prompted
- **Input**: Google account credentials
- **Expected Result**: User is successfully signed in with Google and redirected to Home screen
- **Status**: Not Tested

### TC-FR1.3-NEG-001: Google Sign In Cancelled
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.3-NEG-001
- **Priority**: Medium
- **Description**: Verify graceful handling when user cancels Google sign in
- **Reference**: FR1.3
- **Users**: Guest User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User is on Login screen
- **Steps**: 
  - A. Navigate to Login screen
  - B. Tap "Sign in with Google" button
  - C. Cancel Google account selection
- **Input**: None
- **Expected Result**: User remains on Login screen, no error displayed, user can retry
- **Status**: Not Tested

### TC-FR1.4-POS-001: Email Verification Successful
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.4-POS-001
- **Priority**: High
- **Description**: Verify user can verify email address successfully
- **Reference**: FR1.4
- **Users**: Registered User (Unverified)
- **Pre-Requisites**: 
  - A. User has signed up with email
  - B. User has received verification email
  - C. User is on Email Verification screen
- **Steps**: 
  - A. Open verification email from inbox
  - B. Click verification link
  - C. Return to app
  - D. Tap "Check Verification" or reload app
- **Input**: Verification link from email
- **Expected Result**: Email is verified, user is redirected to Home screen or avatar onboarding
- **Status**: Not Tested

### TC-FR1.4-NEG-001: Email Verification Not Completed
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.4-NEG-001
- **Priority**: High
- **Description**: Verify user cannot access authenticated features without email verification
- **Reference**: FR1.4
- **Users**: Registered User (Unverified)
- **Pre-Requisites**: 
  - A. User has signed up but not verified email
  - B. User is signed in
- **Steps**: 
  - A. Attempt to add product to cart
  - B. Attempt to access profile features
- **Input**: None
- **Expected Result**: User is blocked from authenticated features, prompted to verify email
- **Status**: Not Tested

### TC-FR1.5-POS-001: Password Reset Email Sent
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.5-POS-001
- **Priority**: High
- **Description**: Verify password reset email is sent to registered email
- **Reference**: FR1.5
- **Users**: Registered User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User is on Forgot Password screen
  - C. User has registered account
- **Steps**: 
  - A. Navigate to Forgot Password screen
  - B. Enter registered email address
  - C. Tap "Send Reset Link" button
- **Input**: Email: testuser@example.com
- **Expected Result**: Success message displayed, password reset email sent to user's inbox
- **Status**: Not Tested

### TC-FR1.5-NEG-001: Password Reset with Non-Existent Email
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.5-NEG-001
- **Priority**: Medium
- **Description**: Verify system handles password reset request for non-existent email gracefully
- **Reference**: FR1.5
- **Users**: Guest User
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. User is on Forgot Password screen
- **Steps**: 
  - A. Navigate to Forgot Password screen
  - B. Enter non-existent email address
  - C. Tap "Send Reset Link" button
- **Input**: Email: nonexistent@example.com
- **Expected Result**: Generic success message displayed (for security), no error about email not found
- **Status**: Not Tested

### TC-FR1.6-POS-001: Successful Sign Out
- **Implemented in code**: Yes — Auth via Firebase in `authService` + auth screens + AppNavigator gating
- **ID**: TC-FR1.6-POS-001
- **Priority**: High
- **Description**: Verify user can successfully sign out
- **Reference**: FR1.6
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User is on any authenticated screen
- **Steps**: 
  - A. Navigate to Profile screen
  - B. Tap "Sign Out" button
  - C. Confirm sign out if prompted
- **Input**: None
- **Expected Result**: User is signed out and redirected to Login screen or Home screen (guest mode)
- **Status**: Not Tested

### TC-FR2.1-POS-001: View Personal Information
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.1-POS-001
- **Priority**: Medium
- **Description**: Verify user can view their personal information
- **Reference**: FR2.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has completed profile setup
- **Steps**: 
  - A. Navigate to Profile screen
  - B. Tap "Personal Information" option
- **Input**: None
- **Expected Result**: Personal Information screen displays user's name, email, and avatar
- **Status**: Not Tested

### TC-FR2.2-POS-001: Update Name Successfully
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.2-POS-001
- **Priority**: Medium
- **Description**: Verify user can update their name
- **Reference**: FR2.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Personal Information screen
- **Steps**: 
  - A. Navigate to Personal Information screen
  - B. Tap on Name field
  - C. Enter new name
  - D. Tap "Save" button
- **Input**: New Name: John Doe
- **Expected Result**: Name is updated successfully, updated name is displayed in profile
- **Status**: Not Tested

### TC-FR2.2-NEG-001: Update Name with Empty Value
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.2-NEG-001
- **Priority**: Medium
- **Description**: Verify system rejects empty name update
- **Reference**: FR2.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Personal Information screen
- **Steps**: 
  - A. Navigate to Personal Information screen
  - B. Tap on Name field
  - C. Clear name field (leave empty)
  - D. Tap "Save" button
- **Input**: Name: (empty)
- **Expected Result**: Error message displayed indicating name cannot be empty, update fails
- **Status**: Not Tested

### TC-FR2.3-POS-001: Change Email Successfully
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.3-POS-001
- **Priority**: High
- **Description**: Verify user can change email address with correct password
- **Reference**: FR2.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Personal Information screen
  - C. User knows current password
- **Steps**: 
  - A. Navigate to Personal Information screen
  - B. Tap "Change Email" option
  - C. Enter new email address
  - D. Enter current password
  - E. Tap "Update Email" button
- **Input**: New Email: newemail@example.com, Current Password: Test123!
- **Expected Result**: Email is updated, verification email sent to new address, user must verify new email
- **Status**: Not Tested

### TC-FR2.3-NEG-001: Change Email with Incorrect Password
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.3-NEG-001
- **Priority**: High
- **Description**: Verify system rejects email change with incorrect password
- **Reference**: FR2.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Change Email screen
- **Steps**: 
  - A. Navigate to Change Email screen
  - B. Enter new email address
  - C. Enter incorrect current password
  - D. Tap "Update Email" button
- **Input**: New Email: newemail@example.com, Current Password: WrongPass123!
- **Expected Result**: Error message displayed indicating incorrect password, email change fails
- **Status**: Not Tested

### TC-FR2.4-POS-001: Change Password Successfully
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.4-POS-001
- **Priority**: High
- **Description**: Verify user can change password with correct current password
- **Reference**: FR2.4
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Settings screen
  - C. User knows current password
- **Steps**: 
  - A. Navigate to Settings screen
  - B. Tap "Change Password" option
  - C. Enter current password
  - D. Enter new password (minimum 6 characters)
  - E. Confirm new password
  - F. Tap "Update Password" button
- **Input**: Current Password: Test123!, New Password: NewPass123!
- **Expected Result**: Password is updated successfully, user can sign in with new password
- **Status**: Not Tested

### TC-FR2.4-NEG-001: Change Password with Incorrect Current Password
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.4-NEG-001
- **Priority**: High
- **Description**: Verify system rejects password change with incorrect current password
- **Reference**: FR2.4
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Change Password screen
- **Steps**: 
  - A. Navigate to Change Password screen
  - B. Enter incorrect current password
  - C. Enter new password
  - D. Confirm new password
  - E. Tap "Update Password" button
- **Input**: Current Password: WrongPass123!, New Password: NewPass123!
- **Expected Result**: Error message displayed indicating incorrect current password, password change fails
- **Status**: Not Tested

### TC-FR2.5-POS-001: Select Avatar Successfully
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.5-POS-001
- **Priority**: Low
- **Description**: Verify user can select and update avatar
- **Reference**: FR2.5
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Personal Information screen
- **Steps**: 
  - A. Navigate to Personal Information screen
  - B. Tap on Avatar
  - C. Select an avatar from available options
  - D. Confirm selection
- **Input**: Avatar ID: m1
- **Expected Result**: Avatar is updated successfully, new avatar is displayed in profile
- **Status**: Not Tested

### TC-FR2.6-POS-001: Complete Avatar Onboarding
- **Implemented in code**: Yes — Profile via `userService` + profile screens + onboarding gate
- **ID**: TC-FR2.6-POS-001
- **Priority**: Medium
- **Description**: Verify new user completes avatar onboarding flow
- **Reference**: FR2.6
- **Users**: New Authenticated User (No Avatar)
- **Pre-Requisites**: 
  - A. User has signed up and verified email
  - B. User has no avatar selected
- **Steps**: 
  - A. User signs in after email verification
  - B. Avatar Welcome screen is displayed
  - C. Tap "Choose Avatar" button
  - D. Select an avatar
  - E. Tap "Continue" button
- **Input**: Avatar ID: w1
- **Expected Result**: Avatar is selected, user is redirected to final welcome screen, then to Home screen
- **Status**: Not Tested

### TC-FR3.1-POS-001: Browse Products Successfully
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.1-POS-001
- **Priority**: High
- **Description**: Verify user can browse all available products
- **Reference**: FR3.1
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. App is installed and launched
  - B. Products exist in database
- **Steps**: 
  - A. Navigate to Products tab
  - B. Scroll through product list
- **Input**: None
- **Expected Result**: Product list is displayed with product images, names, prices, and categories
- **Status**: Not Tested

### TC-FR3.2-POS-001: View Product Details
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.2-POS-001
- **Priority**: High
- **Description**: Verify user can view detailed product information
- **Reference**: FR3.2
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Products screen
  - B. Products are available
- **Steps**: 
  - A. Navigate to Products tab
  - B. Tap on any product
- **Input**: Product ID: prod123
- **Expected Result**: Product Details screen displays product images, title, description, price, stock, brand, rating, and action buttons
- **Status**: Not Tested

### TC-FR3.3-POS-001: Search Products Successfully
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.3-POS-001
- **Priority**: Medium
- **Description**: Verify user can search for products
- **Reference**: FR3.3
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Products screen
  - B. Products exist in database
- **Steps**: 
  - A. Navigate to Products tab
  - B. Tap on search bar
  - C. Enter search term
  - D. View search results
- **Input**: Search Term: "laptop"
- **Expected Result**: Products matching search term are displayed in results
- **Status**: Not Tested

### TC-FR3.3-NEG-001: Search with No Results
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.3-NEG-001
- **Priority**: Low
- **Description**: Verify system handles search with no matching products
- **Reference**: FR3.3
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Products screen
- **Steps**: 
  - A. Navigate to Products tab
  - B. Tap on search bar
  - C. Enter search term with no matches
  - D. View search results
- **Input**: Search Term: "xyzabc123nonexistent"
- **Expected Result**: "No products found" message is displayed
- **Status**: Not Tested

### TC-FR3.4-POS-001: Filter Products by Category
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.4-POS-001
- **Priority**: Medium
- **Description**: Verify user can filter products by category
- **Reference**: FR3.4
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Products screen
  - B. Categories exist in database
- **Steps**: 
  - A. Navigate to Products tab
  - B. Tap on category filter
  - C. Select a category
- **Input**: Category: "Electronics"
- **Expected Result**: Only products from selected category are displayed
- **Status**: Not Tested

### TC-FR3.5-POS-001: View Featured Products
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.5-POS-001
- **Priority**: Medium
- **Description**: Verify user can view featured products on Home screen
- **Reference**: FR3.5
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Home screen
  - B. Featured products exist in database
- **Steps**: 
  - A. Navigate to Home tab
  - B. Scroll to Featured Products section
- **Input**: None
- **Expected Result**: Featured products are displayed in a scrollable section
- **Status**: Not Tested

### TC-FR3.6-POS-001: View New Arrivals
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.6-POS-001
- **Priority**: Medium
- **Description**: Verify user can view new arrival products
- **Reference**: FR3.6
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Home screen
  - B. New arrival products exist in database
- **Steps**: 
  - A. Navigate to Home tab
  - B. Scroll to New Arrivals section
- **Input**: None
- **Expected Result**: New arrival products are displayed in a scrollable section
- **Status**: Not Tested

### TC-FR3.7-POS-001: View Best Sellers
- **Implemented in code**: Yes — Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories
- **ID**: TC-FR3.7-POS-001
- **Priority**: Medium
- **Description**: Verify user can view best seller products
- **Reference**: FR3.7
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Home screen
  - B. Best seller products exist in database
- **Steps**: 
  - A. Navigate to Home tab
  - B. Scroll to Best Sellers section
- **Input**: None
- **Expected Result**: Best seller products are displayed in a scrollable section
- **Status**: Not Tested

### TC-FR4.1-POS-001: Add Product to Cart (Authenticated User)
- **Implemented in code**: Yes — Cart via `cartService` + `CartScreen` (Firestore for verified users)
- **ID**: TC-FR4.1-POS-001
- **Priority**: High
- **Description**: Verify authenticated user can add product to cart
- **Reference**: FR4.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Product Details screen
  - C. Product is in stock
- **Steps**: 
  - A. Navigate to Product Details screen
  - B. Tap "Add to Cart" button
- **Input**: Product ID: prod123, Quantity: 1
- **Expected Result**: Product is added to cart, cart count increases, success message displayed
- **Status**: Not Tested

### TC-FR4.1-NEG-001: Add Out of Stock Product to Cart
- **Implemented in code**: Yes — Cart via `cartService` + `CartScreen` (Firestore for verified users)
- **ID**: TC-FR4.1-NEG-001
- **Priority**: High
- **Description**: Verify system prevents adding out of stock product to cart
- **Reference**: FR4.1
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Product Details screen
  - B. Product has stock = 0
- **Steps**: 
  - A. Navigate to Product Details screen
  - B. Tap "Add to Cart" button
- **Input**: Product ID: prod123 (stock: 0)
- **Expected Result**: Error message displayed indicating product is out of stock, product not added to cart
- **Status**: Not Tested

### TC-FR4.2-POS-001: Update Cart Item Quantity
- **Implemented in code**: Yes — Cart via `cartService` + `CartScreen` (Firestore for verified users)
- **ID**: TC-FR4.2-POS-001
- **Priority**: High
- **Description**: Verify user can update quantity of item in cart
- **Reference**: FR4.2
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User has items in cart
  - B. User is on Cart screen
  - C. Product has sufficient stock
- **Steps**: 
  - A. Navigate to Cart screen
  - B. Tap increment button for an item
- **Input**: Product ID: prod123, New Quantity: 2
- **Expected Result**: Item quantity is updated, cart total is recalculated, stock is validated
- **Status**: Not Tested

### TC-FR4.2-NEG-001: Update Quantity Exceeding Stock
- **Implemented in code**: Yes — Cart via `cartService` + `CartScreen` (Firestore for verified users)
- **ID**: TC-FR4.2-NEG-001
- **Priority**: High
- **Description**: Verify system prevents updating quantity beyond available stock
- **Reference**: FR4.2
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User has items in cart
  - B. User is on Cart screen
  - C. Product has limited stock (e.g., 3 items)
- **Steps**: 
  - A. Navigate to Cart screen
  - B. Tap increment button to exceed stock limit
- **Input**: Product ID: prod123, Requested Quantity: 5, Available Stock: 3
- **Expected Result**: Error message displayed indicating only 3 items available, quantity not updated
- **Status**: Not Tested

### TC-FR4.3-POS-001: Remove Item from Cart
- **Implemented in code**: Yes — Cart via `cartService` + `CartScreen` (Firestore for verified users)
- **ID**: TC-FR4.3-POS-001
- **Priority**: High
- **Description**: Verify user can remove item from cart
- **Reference**: FR4.3
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User has items in cart
  - B. User is on Cart screen
- **Steps**: 
  - A. Navigate to Cart screen
  - B. Tap remove/delete button for an item
- **Input**: Product ID: prod123
- **Expected Result**: Item is removed from cart, cart count decreases, cart total is recalculated
- **Status**: Not Tested

### TC-FR4.4-POS-001: View Cart
- **Implemented in code**: Yes — Cart via `cartService` + `CartScreen` (Firestore for verified users)
- **ID**: TC-FR4.4-POS-001
- **Priority**: High
- **Description**: Verify user can view cart with all items
- **Reference**: FR4.4
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User has items in cart
- **Steps**: 
  - A. Navigate to Cart tab
- **Input**: None
- **Expected Result**: Cart screen displays all cart items with details, quantities, prices, and total
- **Status**: Not Tested

### TC-FR4.5-POS-001: Guest Cart Persistence
- **Implemented in code**: Partial — Guest cart exists in `cartService` (AsyncStorage), but `CartScreen` currently shows empty for guests (no guest cart UI)
- **ID**: TC-FR4.5-POS-001
- **Priority**: Medium
- **Description**: Verify guest cart persists in local storage
- **Reference**: FR4.5
- **Users**: Guest User
- **Pre-Requisites**: 
  - A. User is not signed in
  - B. User has added items to cart
- **Steps**: 
  - A. Add items to cart as guest
  - B. Close app
  - C. Reopen app
  - D. Navigate to Cart tab
- **Input**: None
- **Expected Result**: Cart items are still present after app restart
- **Status**: Not Tested

### TC-FR4.6-POS-001: Cart Migration on Login
- **Implemented in code**: Yes — Cart via `cartService` + `CartScreen` (Firestore for verified users)
- **ID**: TC-FR4.6-POS-001
- **Priority**: High
- **Description**: Verify guest cart items migrate to user cart on login
- **Reference**: FR4.6
- **Users**: Guest User → Authenticated User
- **Pre-Requisites**: 
  - A. User is not signed in
  - B. User has items in guest cart
- **Steps**: 
  - A. Add items to cart as guest
  - B. Sign in with verified account
- **Input**: Guest cart items: [prod123, prod456]
- **Expected Result**: Guest cart items are migrated to user's Firestore cart, local storage cart is cleared
- **Status**: Not Tested

### TC-FR5.1-POS-001: Add Product to Wishlist
- **Implemented in code**: Yes — Wishlist via `wishlistService` + Product/Wishlist screens
- **ID**: TC-FR5.1-POS-001
- **Priority**: Medium
- **Description**: Verify authenticated user can add product to wishlist
- **Reference**: FR5.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Product Details screen
- **Steps**: 
  - A. Navigate to Product Details screen
  - B. Tap wishlist/heart icon
- **Input**: Product ID: prod123
- **Expected Result**: Product is added to wishlist, wishlist icon changes to filled state
- **Status**: Not Tested

### TC-FR5.1-NEG-001: Add to Wishlist Without Authentication
- **Implemented in code**: Yes — Wishlist via `wishlistService` + Product/Wishlist screens
- **ID**: TC-FR5.1-NEG-001
- **Priority**: Medium
- **Description**: Verify guest user cannot add product to wishlist
- **Reference**: FR5.1
- **Users**: Guest User
- **Pre-Requisites**: 
  - A. User is not signed in
  - B. User is on Product Details screen
- **Steps**: 
  - A. Navigate to Product Details screen
  - B. Tap wishlist/heart icon
- **Input**: Product ID: prod123
- **Expected Result**: User is prompted to sign in, product not added to wishlist
- **Status**: Not Tested

### TC-FR5.2-POS-001: Remove Product from Wishlist
- **Implemented in code**: Yes — Wishlist via `wishlistService` + Product/Wishlist screens
- **ID**: TC-FR5.2-POS-001
- **Priority**: Medium
- **Description**: Verify user can remove product from wishlist
- **Reference**: FR5.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. Product is in user's wishlist
  - C. User is on Product Details screen or Wishlist screen
- **Steps**: 
  - A. Navigate to Product Details screen or Wishlist screen
  - B. Tap wishlist/heart icon (filled state)
- **Input**: Product ID: prod123
- **Expected Result**: Product is removed from wishlist, wishlist icon changes to unfilled state
- **Status**: Not Tested

### TC-FR5.3-POS-001: View Wishlist
- **Implemented in code**: Yes — Wishlist via `wishlistService` + Product/Wishlist screens
- **ID**: TC-FR5.3-POS-001
- **Priority**: Medium
- **Description**: Verify user can view their wishlist
- **Reference**: FR5.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has items in wishlist
- **Steps**: 
  - A. Navigate to Profile screen
  - B. Tap "Wishlist" option
- **Input**: None
- **Expected Result**: Wishlist screen displays all wishlisted products
- **Status**: Not Tested

### TC-FR5.4-POS-001: Move from Wishlist to Cart
- **Implemented in code**: Yes — Wishlist via `wishlistService` + Product/Wishlist screens
- **ID**: TC-FR5.4-POS-001
- **Priority**: Medium
- **Description**: Verify user can move product from wishlist to cart
- **Reference**: FR5.4
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Wishlist screen
  - C. Product is in stock
- **Steps**: 
  - A. Navigate to Wishlist screen
  - B. Tap "Add to Cart" button on a wishlist item
- **Input**: Product ID: prod123
- **Expected Result**: Product is added to cart, product remains in wishlist (or removed based on implementation)
- **Status**: Not Tested

### TC-FR6.1-POS-001: Select Shipping Address
- **Implemented in code**: Yes — Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`
- **ID**: TC-FR6.1-POS-001
- **Priority**: High
- **Description**: Verify user can select shipping address during checkout
- **Reference**: FR6.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has items in cart
  - C. User has saved addresses
  - D. User is on Checkout screen
- **Steps**: 
  - A. Navigate to Checkout screen
  - B. Tap on address section
  - C. Select a saved address
- **Input**: Address ID: addr123
- **Expected Result**: Selected address is displayed, address is used for order
- **Status**: Not Tested

### TC-FR6.1-NEG-001: Checkout Without Address
- **Implemented in code**: Yes — Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`
- **ID**: TC-FR6.1-NEG-001
- **Priority**: High
- **Description**: Verify system prevents checkout without shipping address
- **Reference**: FR6.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has items in cart
  - C. User has no saved addresses
  - D. User is on Checkout screen
- **Steps**: 
  - A. Navigate to Checkout screen
  - B. Attempt to proceed without selecting/adding address
  - C. Tap "Place Order" button
- **Input**: None
- **Expected Result**: Error message displayed prompting user to add/select address, order not placed
- **Status**: Not Tested

### TC-FR6.2-POS-001: Select Payment Method
- **Implemented in code**: Yes — Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`
- **ID**: TC-FR6.2-POS-001
- **Priority**: High
- **Description**: Verify user can select payment method during checkout
- **Reference**: FR6.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has items in cart
  - C. User is on Checkout screen
- **Steps**: 
  - A. Navigate to Checkout screen
  - B. Select payment method (Cash on Delivery or Card Payment)
- **Input**: Payment Method: "cash_on_delivery"
- **Expected Result**: Selected payment method is displayed, user can proceed with order
- **Status**: Not Tested

### TC-FR6.2-NEG-001: Checkout with Card Payment Without Card
- **Implemented in code**: Yes — Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`
- **ID**: TC-FR6.2-NEG-001
- **Priority**: High
- **Description**: Verify system prevents card payment without saved card
- **Reference**: FR6.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has items in cart
  - C. User has no saved payment cards
  - D. User is on Checkout screen
- **Steps**: 
  - A. Navigate to Checkout screen
  - B. Select "Card Payment" option
  - C. Attempt to proceed without selecting card
  - D. Tap "Place Order" button
- **Input**: Payment Method: "card_payment", No saved cards
- **Expected Result**: Error message displayed prompting user to add payment card, order not placed
- **Status**: Not Tested

### TC-FR6.3-POS-001: Place Order Successfully
- **Implemented in code**: Yes — Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`
- **ID**: TC-FR6.3-POS-001
- **Priority**: High
- **Description**: Verify user can successfully place order
- **Reference**: FR6.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has items in cart
  - C. User has selected shipping address
  - D. User has selected payment method
  - E. All products in cart are in stock
  - F. User is on Checkout screen
- **Steps**: 
  - A. Navigate to Checkout screen
  - B. Verify address and payment method
  - C. Tap "Place Order" button
- **Input**: Cart items: [prod123, prod456], Address: addr123, Payment: cash_on_delivery
- **Expected Result**: Order is placed successfully, stock is deducted, cart is cleared, user is redirected to Order Placed screen
- **Status**: Not Tested

### TC-FR6.3-NEG-001: Place Order with Out of Stock Item
- **Implemented in code**: Yes — Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`
- **ID**: TC-FR6.3-NEG-001
- **Priority**: High
- **Description**: Verify system prevents placing order when item becomes out of stock
- **Reference**: FR6.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has items in cart
  - C. One or more items become out of stock between adding to cart and checkout
  - D. User is on Checkout screen
- **Steps**: 
  - A. Navigate to Checkout screen
  - B. Tap "Place Order" button
- **Input**: Cart items: [prod123 (stock: 0), prod456]
- **Expected Result**: Error message displayed indicating insufficient stock, order not placed, cart updated
- **Status**: Not Tested

### TC-FR6.4-POS-001: View Order Confirmation
- **Implemented in code**: Yes — Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`
- **ID**: TC-FR6.4-POS-001
- **Priority**: High
- **Description**: Verify user can view order confirmation after placing order
- **Reference**: FR6.4
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User has successfully placed an order
- **Steps**: 
  - A. After placing order, view Order Placed screen
- **Input**: Order ID: order123
- **Expected Result**: Order confirmation screen displays order ID, order details, and estimated delivery information
- **Status**: Not Tested

### TC-FR7.1-POS-001: View Order History
- **Implemented in code**: Yes — Orders via `orderService` + Order screens
- **ID**: TC-FR7.1-POS-001
- **Priority**: High
- **Description**: Verify user can view their order history
- **Reference**: FR7.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has placed orders
- **Steps**: 
  - A. Navigate to Profile screen
  - B. Tap "Orders" option
- **Input**: None
- **Expected Result**: Order History screen displays all user's orders sorted by date (newest first)
- **Status**: Not Tested

### TC-FR7.2-POS-001: View Order Details
- **Implemented in code**: Yes — Orders via `orderService` + Order screens
- **ID**: TC-FR7.2-POS-001
- **Priority**: High
- **Description**: Verify user can view detailed information of an order
- **Reference**: FR7.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has placed orders
  - C. User is on Order History screen
- **Steps**: 
  - A. Navigate to Order History screen
  - B. Tap on an order
- **Input**: Order ID: order123
- **Expected Result**: Order Detail screen displays order items, shipping address, payment method, order status, timeline, and total
- **Status**: Not Tested

### TC-FR7.3-POS-001: Request Order Cancellation
- **Implemented in code**: Yes — Orders via `orderService` + Order screens
- **ID**: TC-FR7.3-POS-001
- **Priority**: High
- **Description**: Verify user can request order cancellation
- **Reference**: FR7.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has an order with status "processing" or "shipped"
  - C. User is on Order Detail screen
- **Steps**: 
  - A. Navigate to Order Detail screen
  - B. Tap "Cancel Order" button
  - C. Enter cancellation reason (optional)
  - D. Confirm cancellation request
- **Input**: Order ID: order123, Reason: "Changed my mind"
- **Expected Result**: Cancellation request is submitted, order status shows cancellation requested, admin is notified
- **Status**: Not Tested

### TC-FR7.3-NEG-001: Request Cancellation for Delivered Order
- **Implemented in code**: Yes — Orders via `orderService` + Order screens
- **ID**: TC-FR7.3-NEG-001
- **Priority**: High
- **Description**: Verify system prevents cancellation request for delivered orders
- **Reference**: FR7.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has an order with status "delivered"
  - C. User is on Order Detail screen
- **Steps**: 
  - A. Navigate to Order Detail screen
  - B. Attempt to tap "Cancel Order" button
- **Input**: Order ID: order123 (status: delivered)
- **Expected Result**: Cancel Order button is disabled or error message displayed indicating delivered orders cannot be cancelled
- **Status**: Not Tested

### TC-FR7.4-POS-001: Track Order Status
- **Implemented in code**: Yes — Orders via `orderService` + Order screens
- **ID**: TC-FR7.4-POS-001
- **Priority**: Medium
- **Description**: Verify user can track order status in real-time
- **Reference**: FR7.4
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has placed orders
  - C. User is on Order Detail screen
- **Steps**: 
  - A. Navigate to Order Detail screen
  - B. View order timeline/status section
- **Input**: Order ID: order123
- **Expected Result**: Order status and timeline are displayed and update in real-time when admin changes status
- **Status**: Not Tested

### TC-FR8.1-POS-001: Add Shipping Address
- **Implemented in code**: Yes — Addresses via `addressService` + address screens
- **ID**: TC-FR8.1-POS-001
- **Priority**: High
- **Description**: Verify user can add new shipping address
- **Reference**: FR8.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Shipping Addresses screen
- **Steps**: 
  - A. Navigate to Shipping Addresses screen
  - B. Tap "Add Address" button
  - C. Fill in address form (name, street, city, state, zip code, country)
  - D. Optionally set as default
  - E. Tap "Save" button
- **Input**: Name: John Doe, Street: 123 Main St, City: New York, State: NY, Zip: 10001, Country: USA, IsDefault: true
- **Expected Result**: Address is saved successfully, appears in address list, set as default if selected
- **Status**: Not Tested

### TC-FR8.1-NEG-001: Add Address with Invalid Data
- **Implemented in code**: Yes — Addresses via `addressService` + address screens
- **ID**: TC-FR8.1-NEG-001
- **Priority**: Medium
- **Description**: Verify system rejects address with missing required fields
- **Reference**: FR8.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Address Form screen
- **Steps**: 
  - A. Navigate to Address Form screen
  - B. Leave required fields empty
  - C. Tap "Save" button
- **Input**: Name: (empty), Street: (empty), City: New York, State: NY, Zip: 10001, Country: USA
- **Expected Result**: Error messages displayed for empty required fields, address not saved
- **Status**: Not Tested

### TC-FR8.2-POS-001: Edit Shipping Address
- **Implemented in code**: Yes — Addresses via `addressService` + address screens
- **ID**: TC-FR8.2-POS-001
- **Priority**: Medium
- **Description**: Verify user can edit existing shipping address
- **Reference**: FR8.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has saved addresses
  - C. User is on Shipping Addresses screen
- **Steps**: 
  - A. Navigate to Shipping Addresses screen
  - B. Tap on an address
  - C. Modify address fields
  - D. Tap "Save" button
- **Input**: Address ID: addr123, Updated Street: 456 Oak Ave
- **Expected Result**: Address is updated successfully, changes are reflected in address list
- **Status**: Not Tested

### TC-FR8.3-POS-001: Delete Shipping Address
- **Implemented in code**: Yes — Addresses via `addressService` + address screens
- **ID**: TC-FR8.3-POS-001
- **Priority**: Medium
- **Description**: Verify user can delete shipping address
- **Reference**: FR8.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has multiple saved addresses
  - C. User is on Shipping Addresses screen
- **Steps**: 
  - A. Navigate to Shipping Addresses screen
  - B. Tap delete button on an address
  - C. Confirm deletion
- **Input**: Address ID: addr123
- **Expected Result**: Address is deleted successfully, removed from address list
- **Status**: Not Tested

### TC-FR8.4-POS-001: Set Default Address
- **Implemented in code**: Yes — Addresses via `addressService` + address screens
- **ID**: TC-FR8.4-POS-001
- **Priority**: Medium
- **Description**: Verify user can set default shipping address
- **Reference**: FR8.4
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has multiple saved addresses
  - C. User is on Shipping Addresses screen
- **Steps**: 
  - A. Navigate to Shipping Addresses screen
  - B. Tap on an address to edit
  - C. Enable "Set as Default" option
  - D. Tap "Save" button
- **Input**: Address ID: addr123, IsDefault: true
- **Expected Result**: Address is set as default, previous default address is unset, default address is used in checkout
- **Status**: Not Tested

### TC-FR9.1-POS-001: Add Payment Card
- **Implemented in code**: Yes — Payment methods via `paymentMethodService` + payment screens
- **ID**: TC-FR9.1-POS-001
- **Priority**: High
- **Description**: Verify user can add payment card
- **Reference**: FR9.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Payment Methods screen
- **Steps**: 
  - A. Navigate to Payment Methods screen
  - B. Tap "Add Card" button
  - C. Fill in card details (card number, expiry, CVV, cardholder name)
  - D. Optionally set as default
  - E. Tap "Save" button
- **Input**: Card Number: 4111111111111111, Expiry: 12/25, CVV: 123, Cardholder: John Doe, IsDefault: true
- **Expected Result**: Card is saved successfully, appears in payment methods list, set as default if selected
- **Status**: Not Tested

### TC-FR9.1-NEG-001: Add Card with Invalid Card Number
- **Implemented in code**: Yes — Payment methods via `paymentMethodService` + payment screens
- **ID**: TC-FR9.1-NEG-001
- **Priority**: Medium
- **Description**: Verify system rejects card with invalid card number
- **Reference**: FR9.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User is on Add Payment Card screen
- **Steps**: 
  - A. Navigate to Add Payment Card screen
  - B. Enter invalid card number (less than 16 digits or invalid format)
  - C. Fill other required fields
  - D. Tap "Save" button
- **Input**: Card Number: 1234, Expiry: 12/25, CVV: 123, Cardholder: John Doe
- **Expected Result**: Error message displayed indicating invalid card number, card not saved
- **Status**: Not Tested

### TC-FR9.2-POS-001: Edit Payment Card
- **Implemented in code**: Yes — Payment methods via `paymentMethodService` + payment screens
- **ID**: TC-FR9.2-POS-001
- **Priority**: Medium
- **Description**: Verify user can edit payment card details
- **Reference**: FR9.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has saved payment cards
  - C. User is on Payment Methods screen
- **Steps**: 
  - A. Navigate to Payment Methods screen
  - B. Tap on a card
  - C. Modify card details (e.g., expiry date)
  - D. Tap "Save" button
- **Input**: Card ID: card123, Updated Expiry: 12/26
- **Expected Result**: Card is updated successfully, changes are reflected in payment methods list
- **Status**: Not Tested

### TC-FR9.3-POS-001: Delete Payment Card
- **Implemented in code**: Yes — Payment methods via `paymentMethodService` + payment screens
- **ID**: TC-FR9.3-POS-001
- **Priority**: Medium
- **Description**: Verify user can delete payment card
- **Reference**: FR9.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has multiple saved payment cards
  - C. User is on Payment Methods screen
- **Steps**: 
  - A. Navigate to Payment Methods screen
  - B. Tap delete button on a card
  - C. Confirm deletion
- **Input**: Card ID: card123
- **Expected Result**: Card is deleted successfully, removed from payment methods list
- **Status**: Not Tested

### TC-FR9.4-POS-001: Set Default Payment Method
- **Implemented in code**: Yes — Payment methods via `paymentMethodService` + payment screens
- **ID**: TC-FR9.4-POS-001
- **Priority**: Medium
- **Description**: Verify user can set default payment method
- **Reference**: FR9.4
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in with verified email
  - B. User has multiple saved payment cards
  - C. User is on Payment Methods screen
- **Steps**: 
  - A. Navigate to Payment Methods screen
  - B. Tap on a card to edit
  - C. Enable "Set as Default" option
  - D. Tap "Save" button
- **Input**: Card ID: card123, IsDefault: true
- **Expected Result**: Card is set as default, previous default card is unset, default card is used in checkout
- **Status**: Not Tested

### TC-FR10.1-POS-001: Access AR View
- **Implemented in code**: Yes — AR via `ARViewScreen` + Viro + `ModelPlacementARScene`
- **ID**: TC-FR10.1-POS-001
- **Priority**: Medium
- **Description**: Verify user can access AR view for product with 3D model
- **Reference**: FR10.1
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Product Details screen
  - B. Product has modelUrl (3D model available)
- **Steps**: 
  - A. Navigate to Product Details screen
  - B. Tap "View in AR" button
- **Input**: Product ID: prod123 (has modelUrl)
- **Expected Result**: AR View screen opens, camera permission is requested if not granted
- **Status**: Not Tested

### TC-FR10.1-NEG-001: Access AR View Without Model
- **Implemented in code**: Yes — AR via `ARViewScreen` + Viro + `ModelPlacementARScene`
- **ID**: TC-FR10.1-NEG-001
- **Priority**: Low
- **Description**: Verify AR view button is not available for products without 3D model
- **Reference**: FR10.1
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on Product Details screen
  - B. Product does not have modelUrl
- **Steps**: 
  - A. Navigate to Product Details screen
  - B. Look for "View in AR" button
- **Input**: Product ID: prod123 (no modelUrl)
- **Expected Result**: "View in AR" button is not displayed
- **Status**: Not Tested

### TC-FR10.2-POS-001: Grant Camera Permission
- **Implemented in code**: Yes — AR via `ARViewScreen` + Viro + `ModelPlacementARScene`
- **ID**: TC-FR10.2-POS-001
- **Priority**: High
- **Description**: Verify user can grant camera permission for AR view
- **Reference**: FR10.2
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on AR View screen
  - B. Camera permission not granted
- **Steps**: 
  - A. Navigate to AR View screen
  - B. Tap "Allow Camera" button
  - C. Grant permission in system dialog
- **Input**: None
- **Expected Result**: Camera permission is granted, AR view initializes, 3D model is displayed
- **Status**: Not Tested

### TC-FR10.2-NEG-001: Deny Camera Permission
- **Implemented in code**: Yes — AR via `ARViewScreen` + Viro + `ModelPlacementARScene`
- **ID**: TC-FR10.2-NEG-001
- **Priority**: Medium
- **Description**: Verify system handles denied camera permission gracefully
- **Reference**: FR10.2
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on AR View screen
  - B. Camera permission not granted
- **Steps**: 
  - A. Navigate to AR View screen
  - B. Tap "Allow Camera" button
  - C. Deny permission in system dialog
- **Input**: None
- **Expected Result**: Error message displayed indicating camera permission required, user can retry or go back
- **Status**: Not Tested

### TC-FR10.3-POS-001: Place 3D Model in AR
- **Implemented in code**: Yes — AR via `ARViewScreen` + Viro + `ModelPlacementARScene`
- **ID**: TC-FR10.3-POS-001
- **Priority**: Medium
- **Description**: Verify user can place 3D model in AR environment
- **Reference**: FR10.3
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on AR View screen
  - B. Camera permission granted
  - C. AR tracking is active
- **Steps**: 
  - A. Point camera at a flat surface
  - B. Wait for plane detection
  - C. Tap on detected plane to place model
- **Input**: None
- **Expected Result**: 3D model is placed on detected plane, model is visible in AR view
- **Status**: Not Tested

### TC-FR10.4-POS-001: Scale Model in AR
- **Implemented in code**: Yes — AR via `ARViewScreen` + Viro + `ModelPlacementARScene`
- **ID**: TC-FR10.4-POS-001
- **Priority**: Low
- **Description**: Verify user can scale 3D model in AR view
- **Reference**: FR10.4
- **Users**: Any User (Guest or Authenticated)
- **Pre-Requisites**: 
  - A. User is on AR View screen
  - B. 3D model is placed in AR
- **Steps**: 
  - A. Use pinch gesture to scale model
- **Input**: Scale factor: 1.5x
- **Expected Result**: Model size increases/decreases based on pinch gesture
- **Status**: Not Tested

### TC-FR11.1-POS-001: View Dashboard Statistics
- **Implemented in code**: Yes — Admin dashboard via `adminService` + `AdminDashboardScreen`
- **ID**: TC-FR11.1-POS-001
- **Priority**: High
- **Description**: Verify admin can view dashboard statistics
- **Reference**: FR11.1
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Dashboard screen
- **Steps**: 
  - A. Navigate to Admin Dashboard
- **Input**: None
- **Expected Result**: Dashboard displays total users, total products, and total orders statistics
- **Status**: Not Tested

### TC-FR11.1-NEG-001: Access Admin Dashboard as Regular User
- **Implemented in code**: Yes — Admin dashboard via `adminService` + `AdminDashboardScreen`
- **ID**: TC-FR11.1-NEG-001
- **Priority**: High
- **Description**: Verify regular user cannot access admin dashboard
- **Reference**: FR11.1
- **Users**: Regular User
- **Pre-Requisites**: 
  - A. User is signed in as regular user (not admin)
- **Steps**: 
  - A. Attempt to navigate to Admin Dashboard (if accessible via URL or deep link)
- **Input**: None
- **Expected Result**: Access denied message displayed, user cannot view admin dashboard
- **Status**: Not Tested

### TC-FR11.2-POS-001: View Recent Users
- **Implemented in code**: Yes — Admin dashboard via `adminService` + `AdminDashboardScreen`
- **ID**: TC-FR11.2-POS-001
- **Priority**: Medium
- **Description**: Verify admin can view recent users on dashboard
- **Reference**: FR11.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Dashboard screen
  - C. Recent users exist in database
- **Steps**: 
  - A. Navigate to Admin Dashboard
  - B. Scroll to Recent Users section
- **Input**: None
- **Expected Result**: Recent Users section displays up to 5 most recently registered users
- **Status**: Not Tested

### TC-FR11.3-POS-001: View Recent Orders
- **Implemented in code**: Yes — Admin dashboard via `adminService` + `AdminDashboardScreen`
- **ID**: TC-FR11.3-POS-001
- **Priority**: Medium
- **Description**: Verify admin can view recent orders on dashboard
- **Reference**: FR11.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Dashboard screen
  - C. Recent orders exist in database
- **Steps**: 
  - A. Navigate to Admin Dashboard
  - B. Scroll to Recent Orders section
- **Input**: None
- **Expected Result**: Recent Orders section displays up to 5 most recently placed orders
- **Status**: Not Tested

### TC-FR11.4-POS-001: Access Admin Features
- **Implemented in code**: Yes — Admin dashboard via `adminService` + `AdminDashboardScreen`
- **ID**: TC-FR11.4-POS-001
- **Priority**: High
- **Description**: Verify admin can access all admin features
- **Reference**: FR11.4
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
- **Steps**: 
  - A. Navigate to Admin Dashboard
  - B. Verify admin tabs are accessible (Users, Products, Orders)
- **Input**: None
- **Expected Result**: Admin tabs are visible and accessible, admin can navigate to Users, Products, and Orders screens
- **Status**: Not Tested

### TC-FR12.1-POS-001: View All Products (Admin)
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.1-POS-001
- **Priority**: High
- **Description**: Verify admin can view all products
- **Reference**: FR12.1
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Products screen
- **Steps**: 
  - A. Navigate to Admin Products tab
- **Input**: None
- **Expected Result**: All products are displayed in a list with title, category, and price
- **Status**: Not Tested

### TC-FR12.2-POS-001: Create New Product
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.2-POS-001
- **Priority**: High
- **Description**: Verify admin can create new product
- **Reference**: FR12.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Products screen
- **Steps**: 
  - A. Navigate to Admin Products screen
  - B. Tap "Add Product" or "Create Product" button
  - C. Fill in product details (title, description, price, category, stock, images, etc.)
  - D. Tap "Save" button
- **Input**: Title: "New Product", Price: 99.99, Category: "Electronics", Stock: 10, Description: "Product description"
- **Expected Result**: Product is created successfully, appears in products list
- **Status**: Not Tested

### TC-FR12.2-NEG-001: Create Product with Missing Required Fields
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.2-NEG-001
- **Priority**: High
- **Description**: Verify system rejects product creation with missing required fields
- **Reference**: FR12.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Product Edit/Create screen
- **Steps**: 
  - A. Navigate to Product Create screen
  - B. Leave required fields empty (e.g., title, price)
  - C. Tap "Save" button
- **Input**: Title: (empty), Price: (empty), Category: "Electronics"
- **Expected Result**: Error messages displayed for missing required fields, product not created
- **Status**: Not Tested

### TC-FR12.3-POS-001: Edit Product
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.3-POS-001
- **Priority**: High
- **Description**: Verify admin can edit existing product
- **Reference**: FR12.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Products screen
  - C. Products exist in database
- **Steps**: 
  - A. Navigate to Admin Products screen
  - B. Tap on a product
  - C. Modify product details
  - D. Tap "Save" button
- **Input**: Product ID: prod123, Updated Price: 149.99
- **Expected Result**: Product is updated successfully, changes are reflected in products list and product details
- **Status**: Not Tested

### TC-FR12.4-POS-001: Delete Product
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.4-POS-001
- **Priority**: High
- **Description**: Verify admin can delete product
- **Reference**: FR12.4
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Products screen
  - C. Products exist in database
- **Steps**: 
  - A. Navigate to Admin Products screen
  - B. Tap delete button on a product
  - C. Confirm deletion
- **Input**: Product ID: prod123
- **Expected Result**: Product is deleted successfully, removed from products list
- **Status**: Not Tested

### TC-FR12.5-POS-001: Update Product Stock
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.5-POS-001
- **Priority**: High
- **Description**: Verify admin can update product stock
- **Reference**: FR12.5
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Product Edit screen
  - C. Product exists
- **Steps**: 
  - A. Navigate to Product Edit screen
  - B. Update stock field
  - C. Tap "Save" button
- **Input**: Product ID: prod123, Updated Stock: 50
- **Expected Result**: Product stock is updated successfully, changes are reflected in product details and cart items
- **Status**: Not Tested

### TC-FR12.5-NEG-001: Update Stock with Negative Value
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.5-NEG-001
- **Priority**: Medium
- **Description**: Verify system prevents setting negative stock value
- **Reference**: FR12.5
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Product Edit screen
- **Steps**: 
  - A. Navigate to Product Edit screen
  - B. Enter negative stock value
  - C. Tap "Save" button
- **Input**: Product ID: prod123, Stock: -5
- **Expected Result**: Error message displayed indicating stock cannot be negative, stock not updated
- **Status**: Not Tested

### TC-FR12.6-POS-001: Manage Product Categories
- **Implemented in code**: Yes — Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`
- **ID**: TC-FR12.6-POS-001
- **Priority**: Medium
- **Description**: Verify admin can manage product categories
- **Reference**: FR12.6
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Categories screen
- **Steps**: 
  - A. Navigate to Admin Categories screen
  - B. View existing categories
  - C. Add, edit, or delete categories as needed
- **Input**: Category Name: "Furniture"
- **Expected Result**: Categories are managed successfully, changes are reflected in product category options
- **Status**: Not Tested

### TC-FR13.1-POS-001: View All Orders (Admin)
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.1-POS-001
- **Priority**: High
- **Description**: Verify admin can view all orders from all users
- **Reference**: FR13.1
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Orders screen
- **Steps**: 
  - A. Navigate to Admin Orders tab
- **Input**: None
- **Expected Result**: All orders from all users are displayed sorted by date (newest first)
- **Status**: Not Tested

### TC-FR13.2-POS-001: View Order Details (Admin)
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.2-POS-001
- **Priority**: High
- **Description**: Verify admin can view detailed information of a specific order
- **Reference**: FR13.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Orders screen
  - C. At least one order exists
- **Steps**: 
  - A. Navigate to Admin Orders tab
  - B. Tap on an order from the list
- **Input**: Order ID: order123, User ID: user456
- **Expected Result**: Order details screen displays with all order information including items, address, payment method, status, and timeline
- **Status**: Not Tested

### TC-FR13.3-POS-001: Update Order Status to Shipped
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.3-POS-001
- **Priority**: High
- **Description**: Verify admin can update order status from processing to shipped
- **Reference**: FR13.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing order details
  - C. Order status is "processing"
- **Steps**: 
  - A. Navigate to Order Details screen
  - B. Tap "Update Status" button
  - C. Select "Shipped" status
  - D. Optionally add a note
  - E. Confirm the update
- **Input**: Order ID: order123, New Status: "shipped", Note: "Shipped via FedEx"
- **Expected Result**: Order status is updated to "shipped", timeline entry is added, user can see updated status
- **Status**: Not Tested

### TC-FR13.3-NEG-001: Update Cancelled Order Status
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.3-NEG-001
- **Priority**: Medium
- **Description**: Verify system prevents updating status of cancelled orders
- **Reference**: FR13.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing order details
  - C. Order status is "cancelled"
- **Steps**: 
  - A. Navigate to Order Details screen
  - B. Tap "Update Status" button
  - C. Try to select any status other than "cancelled"
- **Input**: Order ID: order123, Attempted Status: "shipped"
- **Expected Result**: Error message displayed indicating cancelled orders cannot be updated, status remains unchanged
- **Status**: Not Tested

### TC-FR13.4-POS-001: Approve Order Cancellation
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.4-POS-001
- **Priority**: High
- **Description**: Verify admin can approve order cancellation and stock is restored
- **Reference**: FR13.4
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing order details
  - C. Order has cancellation request pending
  - D. Order status is not "delivered" or "cancelled"
- **Steps**: 
  - A. Navigate to Order Details screen
  - B. View cancellation request
  - C. Tap "Approve Cancellation" button
  - D. Optionally add a note
  - E. Confirm approval
- **Input**: Order ID: order123, Note: "Cancellation approved"
- **Expected Result**: Order status changes to "cancelled", stock is restored for all items, timeline entry is added, cancellation request flag is cleared
- **Status**: Not Tested

### TC-FR13.4-NEG-001: Approve Cancellation for Already Cancelled Order
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.4-NEG-001
- **Priority**: Medium
- **Description**: Verify system prevents approving cancellation for already cancelled orders
- **Reference**: FR13.4
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing order details
  - C. Order status is "cancelled"
- **Steps**: 
  - A. Navigate to Order Details screen
  - B. Try to approve cancellation
- **Input**: Order ID: order123
- **Expected Result**: Error message displayed indicating order is already cancelled, no action taken
- **Status**: Not Tested

### TC-FR13.5-POS-001: Reject Order Cancellation
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.5-POS-001
- **Priority**: High
- **Description**: Verify admin can reject order cancellation request
- **Reference**: FR13.5
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing order details
  - C. Order has cancellation request pending
- **Steps**: 
  - A. Navigate to Order Details screen
  - B. View cancellation request
  - C. Tap "Reject Cancellation" button
  - D. Enter rejection reason
  - E. Confirm rejection
- **Input**: Order ID: order123, Rejection Reason: "Order already processed"
- **Expected Result**: Cancellation request is rejected, rejection flag is set, timeline entry is added, order status remains unchanged
- **Status**: Not Tested

### TC-FR13.5-NEG-001: Reject Cancellation Without Request
- **Implemented in code**: Yes — Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`
- **ID**: TC-FR13.5-NEG-001
- **Priority**: Medium
- **Description**: Verify system prevents rejecting cancellation when no request exists
- **Reference**: FR13.5
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing order details
  - C. Order has no cancellation request
- **Steps**: 
  - A. Navigate to Order Details screen
  - B. Try to reject cancellation
- **Input**: Order ID: order123
- **Expected Result**: Error message displayed indicating no cancellation request found, no action taken
- **Status**: Not Tested

### TC-FR14.1-POS-001: View All Users (Admin)
- **Implemented in code**: Yes — Admin user management via `adminService` + `AdminUsersScreen`/`AdminUserDetailScreen`
- **ID**: TC-FR14.1-POS-001
- **Priority**: High
- **Description**: Verify admin can view list of all registered users
- **Reference**: FR14.1
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Users screen
- **Steps**: 
  - A. Navigate to Admin Users tab
- **Input**: None
- **Expected Result**: List of all users is displayed with name, email, and role
- **Status**: Not Tested

### TC-FR14.2-POS-001: View User Details (Admin)
- **Implemented in code**: Yes — Admin user management via `adminService` + `AdminUsersScreen`/`AdminUserDetailScreen`
- **ID**: TC-FR14.2-POS-001
- **Priority**: High
- **Description**: Verify admin can view detailed information of a specific user
- **Reference**: FR14.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Users screen
  - C. At least one user exists
- **Steps**: 
  - A. Navigate to Admin Users tab
  - B. Tap on a user from the list
- **Input**: User ID: user456
- **Expected Result**: User details screen displays with profile information, addresses, orders, and tickets
- **Status**: Not Tested

### TC-FR14.3-POS-001: Update User Role to Admin
- **Implemented in code**: Yes — Admin user management via `adminService` + `AdminUsersScreen`/`AdminUserDetailScreen`
- **ID**: TC-FR14.3-POS-001
- **Priority**: High
- **Description**: Verify admin can update a user's role to admin
- **Reference**: FR14.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing user details
  - C. Target user role is "user"
- **Steps**: 
  - A. Navigate to User Details screen
  - B. Tap "Change Role" button
  - C. Select "admin" role
  - D. Confirm the change
- **Input**: User ID: user456, New Role: "admin"
- **Expected Result**: User role is updated to "admin", changes are reflected immediately, user gains admin access
- **Status**: Not Tested

### TC-FR14.3-NEG-001: Update Role with Invalid Value
- **Implemented in code**: Yes — Admin user management via `adminService` + `AdminUsersScreen`/`AdminUserDetailScreen`
- **ID**: TC-FR14.3-NEG-001
- **Priority**: Medium
- **Description**: Verify system prevents setting invalid role values
- **Reference**: FR14.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing user details
- **Steps**: 
  - A. Navigate to User Details screen
  - B. Try to set role to invalid value (e.g., "moderator")
- **Input**: User ID: user456, Invalid Role: "moderator"
- **Expected Result**: Error message displayed indicating invalid role, role not updated
- **Status**: Not Tested

### TC-FR14.4-POS-001: View User Addresses (Admin)
- **Implemented in code**: Yes — Admin user management via `adminService` + `AdminUsersScreen`/`AdminUserDetailScreen`
- **ID**: TC-FR14.4-POS-001
- **Priority**: Medium
- **Description**: Verify admin can view all addresses of a specific user
- **Reference**: FR14.4
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing user details
- **Steps**: 
  - A. Navigate to User Details screen
  - B. View addresses section
- **Input**: User ID: user456
- **Expected Result**: All addresses for the user are displayed with full details
- **Status**: Not Tested

### TC-FR14.5-POS-001: View User Tickets (Admin)
- **Implemented in code**: Yes — Admin user management via `adminService` + `AdminUsersScreen`/`AdminUserDetailScreen`
- **ID**: TC-FR14.5-POS-001
- **Priority**: Medium
- **Description**: Verify admin can view all support tickets submitted by a specific user
- **Reference**: FR14.5
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing user details
- **Steps**: 
  - A. Navigate to User Details screen
  - B. View tickets section
- **Input**: User ID: user456
- **Expected Result**: All tickets submitted by the user are displayed with status and details
- **Status**: Not Tested

### TC-FR15.1-POS-001: View Categories (Admin)
- **Implemented in code**: Yes — Admin categories via `categoryAdminService` + `AdminCategoriesScreen`
- **ID**: TC-FR15.1-POS-001
- **Priority**: Medium
- **Description**: Verify admin can view all product categories
- **Reference**: FR15.1
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Categories screen
- **Steps**: 
  - A. Navigate to Admin Categories screen
- **Input**: None
- **Expected Result**: List of all categories is displayed
- **Status**: Not Tested

### TC-FR15.2-POS-001: Create Category
- **Implemented in code**: Yes — Admin categories via `categoryAdminService` + `AdminCategoriesScreen`
- **ID**: TC-FR15.2-POS-001
- **Priority**: Medium
- **Description**: Verify admin can create a new product category
- **Reference**: FR15.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Categories screen
- **Steps**: 
  - A. Navigate to Admin Categories screen
  - B. Tap "Add Category" button
  - C. Enter category name
  - D. Save the category
- **Input**: Category Name: "Electronics"
- **Expected Result**: New category is created and appears in the categories list, available for product assignment
- **Status**: Not Tested

### TC-FR15.2-NEG-001: Create Duplicate Category
- **Implemented in code**: Yes — Admin categories via `categoryAdminService` + `AdminCategoriesScreen`
- **ID**: TC-FR15.2-NEG-001
- **Priority**: Medium
- **Description**: Verify system prevents creating duplicate category names
- **Reference**: FR15.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Categories screen
  - C. Category "Electronics" already exists
- **Steps**: 
  - A. Navigate to Admin Categories screen
  - B. Tap "Add Category" button
  - C. Enter existing category name
  - D. Try to save
- **Input**: Category Name: "Electronics"
- **Expected Result**: Error message displayed indicating category already exists, category not created
- **Status**: Not Tested

### TC-FR15.3-POS-001: Edit Category
- **Implemented in code**: Yes — Admin categories via `categoryAdminService` + `AdminCategoriesScreen`
- **ID**: TC-FR15.3-POS-001
- **Priority**: Medium
- **Description**: Verify admin can edit an existing category
- **Reference**: FR15.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Categories screen
  - C. Category exists
- **Steps**: 
  - A. Navigate to Admin Categories screen
  - B. Tap edit button on a category
  - C. Modify category name
  - D. Save changes
- **Input**: Category ID: cat123, New Name: "Home Electronics"
- **Expected Result**: Category is updated, changes are reflected in category list and products using this category
- **Status**: Not Tested

### TC-FR15.4-POS-001: Delete Category
- **Implemented in code**: Yes — Admin categories via `categoryAdminService` + `AdminCategoriesScreen`
- **ID**: TC-FR15.4-POS-001
- **Priority**: Medium
- **Description**: Verify admin can delete a category
- **Reference**: FR15.4
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Categories screen
  - C. Category exists
- **Steps**: 
  - A. Navigate to Admin Categories screen
  - B. Tap delete button on a category
  - C. Confirm deletion
- **Input**: Category ID: cat123
- **Expected Result**: Category is deleted, removed from categories list
- **Status**: Not Tested

### TC-FR16.1-POS-001: Submit Support Ticket
- **Implemented in code**: Yes — Support tickets via `ticketService` + Help/MyTickets screens
- **ID**: TC-FR16.1-POS-001
- **Priority**: High
- **Description**: Verify authenticated user can submit a support ticket
- **Reference**: FR16.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User email is verified
  - C. User is on Help & Support screen
- **Steps**: 
  - A. Navigate to Help & Support screen
  - B. Tap "Submit Ticket" button
  - C. Enter message/description
  - D. Submit the ticket
- **Input**: Message: "I need help with my order"
- **Expected Result**: Ticket is created successfully, ticket ID is displayed, ticket appears in "My Tickets" with status "open"
- **Status**: Not Tested

### TC-FR16.1-NEG-001: Submit Ticket Without Email Verification
- **Implemented in code**: Yes — Support tickets via `ticketService` + Help/MyTickets screens
- **ID**: TC-FR16.1-NEG-001
- **Priority**: High
- **Description**: Verify system prevents unverified users from submitting tickets
- **Reference**: FR16.1
- **Users**: Authenticated User (Unverified)
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User email is NOT verified
  - C. User is on Help & Support screen
- **Steps**: 
  - A. Navigate to Help & Support screen
  - B. Try to submit a ticket
- **Input**: Message: "I need help"
- **Expected Result**: Error message displayed indicating email verification is required, ticket not created
- **Status**: Not Tested

### TC-FR16.2-POS-001: View My Tickets
- **Implemented in code**: Yes — Support tickets via `ticketService` + Help/MyTickets screens
- **ID**: TC-FR16.2-POS-001
- **Priority**: High
- **Description**: Verify user can view all their submitted support tickets
- **Reference**: FR16.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User email is verified
  - C. User is on My Tickets screen
- **Steps**: 
  - A. Navigate to My Tickets screen
- **Input**: None
- **Expected Result**: List of all tickets submitted by the user is displayed with status and timestamps
- **Status**: Not Tested

### TC-FR16.3-POS-001: Track Ticket Status
- **Implemented in code**: Yes — Support tickets via `ticketService` + Help/MyTickets screens
- **ID**: TC-FR16.3-POS-001
- **Priority**: Medium
- **Description**: Verify user can view ticket status and timeline
- **Reference**: FR16.3
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User email is verified
  - C. User has at least one ticket
- **Steps**: 
  - A. Navigate to My Tickets screen
  - B. Tap on a ticket to view details
- **Input**: Ticket ID: ticket123
- **Expected Result**: Ticket details display with current status and timeline of status changes
- **Status**: Not Tested

### TC-FR17.1-POS-001: View All Inquiries (Admin)
- **Implemented in code**: Yes — Admin inquiries via `ticketService` + `AdminInquiriesScreen`
- **ID**: TC-FR17.1-POS-001
- **Priority**: High
- **Description**: Verify admin can view all support tickets/inquiries
- **Reference**: FR17.1
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Inquiries screen
- **Steps**: 
  - A. Navigate to Admin Inquiries screen
- **Input**: None
- **Expected Result**: List of all tickets is displayed sorted by date (newest first), unread tickets are highlighted
- **Status**: Not Tested

### TC-FR17.2-POS-001: View Inquiry Details (Admin)
- **Implemented in code**: Yes — Admin inquiries via `ticketService` + `AdminInquiriesScreen`
- **ID**: TC-FR17.2-POS-001
- **Priority**: High
- **Description**: Verify admin can view detailed information of a specific inquiry
- **Reference**: FR17.2
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is on Admin Inquiries screen
  - C. At least one ticket exists
- **Steps**: 
  - A. Navigate to Admin Inquiries screen
  - B. Tap on a ticket from the list
- **Input**: Ticket ID: ticket123
- **Expected Result**: Ticket details screen displays with user information, message, status, and timeline
- **Status**: Not Tested

### TC-FR17.3-POS-001: Update Inquiry Status to In-Progress
- **Implemented in code**: Yes — Admin inquiries via `ticketService` + `AdminInquiriesScreen`
- **ID**: TC-FR17.3-POS-001
- **Priority**: High
- **Description**: Verify admin can update ticket status to in-progress
- **Reference**: FR17.3
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing ticket details
  - C. Ticket status is "open"
- **Steps**: 
  - A. Navigate to Ticket Details screen
  - B. Tap "Update Status" button
  - C. Select "in-progress" status
  - D. Confirm the update
- **Input**: Ticket ID: ticket123, New Status: "in-progress"
- **Expected Result**: Ticket status is updated to "in-progress", timeline entry is added, user can see updated status
- **Status**: Not Tested

### TC-FR17.4-POS-001: Mark Inquiry as Viewed
- **Implemented in code**: Yes — Admin inquiries via `ticketService` + `AdminInquiriesScreen`
- **ID**: TC-FR17.4-POS-001
- **Priority**: Medium
- **Description**: Verify admin can mark an inquiry as viewed
- **Reference**: FR17.4
- **Users**: Admin User
- **Pre-Requisites**: 
  - A. User is signed in as admin
  - B. User is viewing ticket details
  - C. Ticket is not yet viewed
- **Steps**: 
  - A. Navigate to Ticket Details screen
  - B. View the ticket (automatically marked as viewed)
- **Input**: Ticket ID: ticket123
- **Expected Result**: Ticket is marked as viewed, viewedByAdmin flag is set, unread count decreases
- **Status**: Not Tested

### TC-FR18.1-POS-001: Change Theme to Dark Mode
- **Implemented in code**: Yes — Settings via Theme/Font contexts + Settings/Policy/Terms screens
- **ID**: TC-FR18.1-POS-001
- **Priority**: Low
- **Description**: Verify user can switch to dark theme
- **Reference**: FR18.1
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is signed in or using as guest
  - B. User is on Settings screen
  - C. Current theme is light mode
- **Steps**: 
  - A. Navigate to Settings screen
  - B. Tap theme toggle or select dark mode
- **Input**: Theme: "dark"
- **Expected Result**: App theme changes to dark mode, all screens reflect dark theme colors
- **Status**: Not Tested

### TC-FR18.2-POS-001: Increase Font Size
- **Implemented in code**: Yes — Settings via Theme/Font contexts + Settings/Policy/Terms screens
- **ID**: TC-FR18.2-POS-001
- **Priority**: Low
- **Description**: Verify user can increase font size
- **Reference**: FR18.2
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is signed in or using as guest
  - B. User is on Settings screen
- **Steps**: 
  - A. Navigate to Settings screen
  - B. Adjust font size slider to increase
- **Input**: Font Size: "Large"
- **Expected Result**: Font size increases across the app, text is more readable
- **Status**: Not Tested

### TC-FR18.3-POS-001: View Privacy Policy
- **Implemented in code**: Yes — Settings via Theme/Font contexts + Settings/Policy/Terms screens
- **ID**: TC-FR18.3-POS-001
- **Priority**: Low
- **Description**: Verify user can view privacy policy
- **Reference**: FR18.3
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is signed in or using as guest
  - B. User is on Settings screen
- **Steps**: 
  - A. Navigate to Settings screen
  - B. Tap "Privacy Policy" option
- **Input**: None
- **Expected Result**: Privacy Policy screen displays with policy content
- **Status**: Not Tested

### TC-FR18.4-POS-001: View Terms of Service
- **Implemented in code**: Yes — Settings via Theme/Font contexts + Settings/Policy/Terms screens
- **ID**: TC-FR18.4-POS-001
- **Priority**: Low
- **Description**: Verify user can view terms of service
- **Reference**: FR18.4
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is signed in or using as guest
  - B. User is on Settings screen
- **Steps**: 
  - A. Navigate to Settings screen
  - B. Tap "Terms of Service" option
- **Input**: None
- **Expected Result**: Terms of Service screen displays with terms content
- **Status**: Not Tested

### TC-FR19.1-POS-001: View Notifications
- **Implemented in code**: Yes — Notifications via `notificationService` + `NotificationsScreen`
- **ID**: TC-FR19.1-POS-001
- **Priority**: Medium
- **Description**: Verify user can view their notifications
- **Reference**: FR19.1
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User is on Notifications screen
- **Steps**: 
  - A. Navigate to Notifications screen
- **Input**: None
- **Expected Result**: List of notifications is displayed with timestamps, unread notifications are highlighted
- **Status**: Not Tested

### TC-FR19.2-POS-001: Mark Notifications as Read
- **Implemented in code**: Yes — Notifications via `notificationService` + `NotificationsScreen`
- **ID**: TC-FR19.2-POS-001
- **Priority**: Medium
- **Description**: Verify user can mark notifications as read
- **Reference**: FR19.2
- **Users**: Authenticated User
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User is on Notifications screen
  - C. At least one unread notification exists
- **Steps**: 
  - A. Navigate to Notifications screen
  - B. Tap on a notification or tap "Mark All as Read"
- **Input**: Notification ID: notif123
- **Expected Result**: Notification is marked as read, unread count decreases
- **Status**: Not Tested

## Non-Functional Requirements Test Cases

### TC-NFR1.1-POS-001: App Load Time
- **Implemented in code**: Partial — Non-functional requirement is not fully verifiable from code alone (needs measurement/UX testing)
- **ID**: TC-NFR1.1-POS-001
- **Priority**: High
- **Description**: Verify app loads within 3 seconds
- **Reference**: NFR1.1
- **Users**: All Users
- **Pre-Requisites**: 
  - A. App is installed
  - B. Device has internet connection
- **Steps**: 
  - A. Launch the app
  - B. Measure time until home screen is displayed
- **Input**: None
- **Expected Result**: App loads and displays home screen within 3 seconds
- **Status**: Not Tested

### TC-NFR1.2-POS-001: Real-time Data Updates
- **Implemented in code**: Yes — Uses Firestore real-time `onSnapshot` subscriptions across products/cart/orders
- **ID**: TC-NFR1.2-POS-001
- **Priority**: High
- **Description**: Verify real-time data updates reflect within 2 seconds
- **Reference**: NFR1.2
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User is viewing a screen with real-time data (e.g., cart, orders)
- **Steps**: 
  - A. Open cart screen on Device A
  - B. Add item to cart from Device B
  - C. Measure time until Device A reflects the change
- **Input**: Cart item added from another device
- **Expected Result**: Cart on Device A updates within 2 seconds showing the new item
- **Status**: Not Tested

### TC-NFR1.3-POS-001: AR View Initialization
- **Implemented in code**: Partial — Non-functional requirement is not fully verifiable from code alone (needs measurement/UX testing)
- **ID**: TC-NFR1.3-POS-001
- **Priority**: Medium
- **Description**: Verify AR view initializes within 5 seconds
- **Reference**: NFR1.3
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is on Product Details screen
  - B. Product has 3D model
  - C. Camera permission is granted
- **Steps**: 
  - A. Tap "View in AR" button
  - B. Measure time until AR view is ready
- **Input**: Product with 3D model
- **Expected Result**: AR view initializes and is ready for interaction within 5 seconds
- **Status**: Not Tested

### TC-NFR2.1-POS-001: Email Verification Enforcement
- **Implemented in code**: Yes — Email verification enforced in App navigation + service guards (cart/wishlist/tickets)
- **ID**: TC-NFR2.1-POS-001
- **Priority**: High
- **Description**: Verify email verification is required for authenticated features
- **Reference**: NFR2.1
- **Users**: Authenticated User (Unverified)
- **Pre-Requisites**: 
  - A. User is signed in
  - B. User email is NOT verified
- **Steps**: 
  - A. Try to add item to cart
  - B. Try to access wishlist
  - C. Try to place order
- **Input**: None
- **Expected Result**: All actions are blocked with message prompting email verification
- **Status**: Not Tested

### TC-NFR2.2-POS-001: Role-Based Access Control
- **Implemented in code**: Yes — Admin access gated via `isAdmin` checks + AdminTabsGate
- **ID**: TC-NFR2.2-POS-001
- **Priority**: High
- **Description**: Verify admin features are only accessible to admin users
- **Reference**: NFR2.2
- **Users**: Regular User
- **Pre-Requisites**: 
  - A. User is signed in as regular user (not admin)
- **Steps**: 
  - A. Try to navigate to admin dashboard
  - B. Try to access admin URLs directly
- **Input**: None
- **Expected Result**: Access is denied, error message displayed, admin features are not accessible
- **Status**: Not Tested

### TC-NFR3.1-POS-001: Intuitive Navigation
- **Implemented in code**: Partial — Non-functional requirement is not fully verifiable from code alone (needs measurement/UX testing)
- **ID**: TC-NFR3.1-POS-001
- **Priority**: Medium
- **Description**: Verify app navigation is intuitive and easy to use
- **Reference**: NFR3.1
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is using the app for the first time
- **Steps**: 
  - A. Navigate through main screens using bottom tabs
  - B. Navigate to product details
  - C. Navigate to profile sections
- **Input**: None
- **Expected Result**: All navigation is clear and intuitive, users can easily find features
- **Status**: Not Tested

### TC-NFR3.2-POS-001: Responsive UI Design
- **Implemented in code**: Partial — Non-functional requirement is not fully verifiable from code alone (needs measurement/UX testing)
- **ID**: TC-NFR3.2-POS-001
- **Priority**: Medium
- **Description**: Verify UI is responsive across different screen sizes
- **Reference**: NFR3.2
- **Users**: All Users
- **Pre-Requisites**: 
  - A. App is installed on devices with different screen sizes
- **Steps**: 
  - A. Test app on small screen device
  - B. Test app on large screen device
  - C. Test app in landscape orientation
- **Input**: Different screen sizes and orientations
- **Expected Result**: UI adapts properly, no elements are cut off, layout remains usable
- **Status**: Not Tested

### TC-NFR3.3-POS-001: Clear Error Messages
- **Implemented in code**: Yes — User-facing error handling via alerts and screen state across flows
- **ID**: TC-NFR3.3-POS-001
- **Priority**: Medium
- **Description**: Verify error messages are clear and actionable
- **Reference**: NFR3.3
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User is using the app
- **Steps**: 
  - A. Trigger various error scenarios (network error, validation error, etc.)
  - B. Observe error messages displayed
- **Input**: Various error scenarios
- **Expected Result**: Error messages are clear, user-friendly, and provide actionable guidance
- **Status**: Not Tested

### TC-NFR4.1-POS-001: Network Failure Handling
- **Implemented in code**: Partial — Non-functional requirement is not fully verifiable from code alone (needs measurement/UX testing)
- **ID**: TC-NFR4.1-POS-001
- **Priority**: High
- **Description**: Verify app handles network failures gracefully
- **Reference**: NFR4.1
- **Users**: All Users
- **Pre-Requisites**: 
  - A. App is running
  - B. User attempts an action requiring network
- **Steps**: 
  - A. Disable network connection
  - B. Try to load products
  - C. Try to add item to cart
- **Input**: Network disabled
- **Expected Result**: Appropriate error messages displayed, app does not crash, guest cart still works offline
- **Status**: Not Tested

### TC-NFR4.2-POS-001: Data Persistence
- **Implemented in code**: Partial — Non-functional requirement is not fully verifiable from code alone (needs measurement/UX testing)
- **ID**: TC-NFR4.2-POS-001
- **Priority**: High
- **Description**: Verify data persists after app restart
- **Reference**: NFR4.2
- **Users**: All Users
- **Pre-Requisites**: 
  - A. User has added items to cart or wishlist
- **Steps**: 
  - A. Add items to cart
  - B. Close the app completely
  - C. Reopen the app
- **Input**: Cart items, wishlist items
- **Expected Result**: Cart and wishlist items are still present after app restart
- **Status**: Not Tested 