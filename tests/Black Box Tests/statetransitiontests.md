# Shop360 Mobile App - State Transition Test Cases

## Overview

State Transition Testing is a black-box testing technique in which outputs are triggered by changes to the input conditions or changes to 'state' of the system. Tests are designed to execute valid and invalid state transitions. This document describes the most important state transition test cases for the Shop360 mobile app, focusing on core functional requirements.

**State Transition Testing Strategy:**
- **Valid State Transitions**: Testing transitions that should be allowed
- **Invalid State Transitions**: Testing transitions that should be rejected
- **State Persistence**: Verifying states persist correctly
- **State Entry/Exit Actions**: Testing actions that occur when entering/exiting states

---

## ST1: User Authentication State Machine

### State Diagram:
```
Guest → Signed In (Unverified) → Signed In (Verified) → Onboarded (Avatar Selected)
  ↓           ↓                        ↓
Sign Out   Sign Out              Sign Out
```

### States:
- **Guest**: User is not signed in
- **Signed In (Unverified)**: User signed in but email not verified
- **Signed In (Verified)**: User signed in and email verified
- **Onboarded**: User has selected avatar and completed onboarding

### ST1.1: Valid Transition - Guest to Signed In (Unverified)
- **From State**: Guest
- **To State**: Signed In (Unverified)
- **Trigger**: User signs up with email/password
- **Description**: User creates account and is signed in but email not verified
- **Steps**:
  - A. User is in Guest state
  - B. User navigates to Signup screen
  - C. User enters email, password, and name
  - D. User taps "Sign Up" button
- **Expected Result**: 
  - User transitions to Signed In (Unverified) state
  - User is redirected to Email Verification screen
  - User cannot access authenticated features
- **Test Cases**: Sign Up
- **Priority**: High

### ST1.2: Valid Transition - Signed In (Unverified) to Signed In (Verified)
- **From State**: Signed In (Unverified)
- **To State**: Signed In (Verified)
- **Trigger**: User verifies email address
- **Description**: User clicks verification link in email and verifies account
- **Steps**:
  - A. User is in Signed In (Unverified) state
  - B. User receives verification email
  - C. User clicks verification link
  - D. User returns to app and checks verification
- **Expected Result**: 
  - User transitions to Signed In (Verified) state
  - User can now access authenticated features
  - User is redirected to Avatar Onboarding if no avatar selected
- **Test Cases**: Email Verification
- **Priority**: High

### ST1.4: Valid Transition - Any State to Guest (Sign Out)
- **From State**: Signed In (Unverified) / Signed In (Verified) / Onboarded
- **To State**: Guest
- **Trigger**: User signs out
- **Description**: User signs out from any authenticated state
- **Steps**:
  - A. User is in any authenticated state
  - B. User navigates to Profile screen
  - C. User taps "Sign Out" button
  - D. User confirms sign out
- **Expected Result**: 
  - User transitions to Guest state
  - User is redirected to Login screen or Home screen (guest mode)
  - User session is cleared
- **Test Cases**: Sign Out
- **Priority**: High

### ST1.5: Invalid Transition - Guest Accessing Authenticated Features
- **From State**: Guest
- **To State**: N/A (Transition blocked)
- **Trigger**: Guest user attempts to access authenticated feature
- **Description**: Guest user tries to access features requiring authentication
- **Steps**:
  - A. User is in Guest state
  - B. User attempts to add product to wishlist
  - C. User attempts to view order history
  - D. User attempts to submit support ticket
- **Expected Result**: 
  - Transition is blocked
  - User is prompted to sign in
  - User remains in Guest state
- **Test Cases**: Guest Access Restrictions
- **Priority**: High

### ST1.6: Invalid Transition - Unverified User Accessing Authenticated Features
- **From State**: Signed In (Unverified)
- **To State**: N/A (Transition blocked)
- **Trigger**: Unverified user attempts to access authenticated feature
- **Description**: Unverified user tries to access features requiring email verification
- **Steps**:
  - A. User is in Signed In (Unverified) state
  - B. User attempts to add product to cart
  - C. User attempts to add product to wishlist
  - D. User attempts to place order
- **Expected Result**: 
  - Transition is blocked
  - User is prompted to verify email
  - User remains in Signed In (Unverified) state
- **Test Cases**: Email Verification Enforcement
- **Priority**: High

---

## ST2: Order Status State Machine

### State Diagram:
```
processing → shipped → delivered
    ↓
cancellation_requested → cancelled (if approved)
```

### States:
- **processing**: Order is being processed
- **shipped**: Order has been shipped
- **delivered**: Order has been delivered
- **cancelled**: Order has been cancelled
- **cancellation_requested**: User has requested cancellation (pending admin approval)

### ST2.1: Valid Transition - Processing to Shipped
- **From State**: processing
- **To State**: shipped
- **Trigger**: Admin updates order status to shipped
- **Description**: Admin marks order as shipped
- **Steps**:
  - A. Order is in processing state
  - B. Admin navigates to Order Details screen
  - C. Admin selects "Shipped" status
  - D. Admin confirms status update
- **Expected Result**: 
  - Order transitions to shipped state
  - Timeline entry is added with "shipped" status
  - User can see updated status in real-time
- **Test Cases**: Update Order Status
- **Priority**: High

### ST2.2: Valid Transition - Shipped to Delivered
- **From State**: shipped
- **To State**: delivered
- **Trigger**: Admin updates order status to delivered
- **Description**: Admin marks order as delivered
- **Steps**:
  - A. Order is in shipped state
  - B. Admin navigates to Order Details screen
  - C. Admin selects "Delivered" status
  - D. Admin confirms status update
- **Expected Result**: 
  - Order transitions to delivered state
  - Timeline entry is added with "delivered" status
  - User can see updated status in real-time
- **Test Cases**: Update Order Status
- **Priority**: High

### ST2.3: Valid Transition - Processing to Cancellation Requested
- **From State**: processing
- **To State**: cancellation_requested
- **Trigger**: User requests order cancellation
- **Description**: User requests to cancel an order in processing state
- **Steps**:
  - A. Order is in processing state
  - B. User navigates to Order Details screen
  - C. User taps "Cancel Order" button
  - D. User enters cancellation reason (optional)
  - E. User confirms cancellation request
- **Expected Result**: 
  - Order transitions to cancellation_requested state
  - cancellationRequested flag is set to true
  - Admin is notified of cancellation request
  - User sees "Cancellation Requested" status
- **Test Cases**: Request Order Cancellation
- **Priority**: High

### ST2.5: Valid Transition - Cancellation Requested to Cancelled (Approved)
- **From State**: cancellation_requested
- **To State**: cancelled
- **Trigger**: Admin approves cancellation request
- **Description**: Admin approves user's cancellation request
- **Steps**:
  - A. Order is in cancellation_requested state
  - B. Admin navigates to Order Details screen
  - C. Admin views cancellation request
  - D. Admin taps "Approve Cancellation" button
  - E. Admin confirms approval
- **Expected Result**: 
  - Order transitions to cancelled state
  - Stock is restored for all items in order
  - Timeline entry is added with "cancelled" status
  - cancellationRequested flag is cleared
- **Test Cases**: Approve Order Cancellation
- **Priority**: High

### ST2.8: Invalid Transition - Delivered to Any Other State
- **From State**: delivered
- **To State**: processing / shipped / cancelled (invalid)
- **Trigger**: Admin attempts to change delivered order status
- **Description**: Admin tries to change status of a delivered order
- **Steps**:
  - A. Order is in delivered state
  - B. Admin navigates to Order Details screen
  - C. Admin attempts to change status to processing or shipped
- **Expected Result**: 
  - Transition is blocked
  - Error message displayed: "Cannot change status of a delivered order"
  - Order remains in delivered state
- **Test Cases**: Order Status Validation
- **Priority**: High

---

## ST3: Support Ticket Status State Machine

### State Diagram:
```
open → in-progress → resolved
  ↓
closed (terminal state)
```

### States:
- **open**: Ticket is newly created and awaiting admin response
- **in-progress**: Admin is working on the ticket
- **resolved**: Ticket issue has been resolved
- **closed**: Ticket is closed (terminal state)

### ST3.1: Valid Transition - Open to In-Progress
- **From State**: open
- **To State**: in-progress
- **Trigger**: Admin updates ticket status to in-progress
- **Description**: Admin starts working on a ticket
- **Steps**:
  - A. Ticket is in open state
  - B. Admin navigates to Ticket Details screen
  - C. Admin selects "in-progress" status
  - D. Admin confirms status update
- **Expected Result**: 
  - Ticket transitions to in-progress state
  - Timeline entry is added with "in-progress" status
  - User can see updated status in real-time
- **Test Cases**: Update Ticket Status
- **Priority**: High

### ST3.2: Valid Transition - In-Progress to Resolved
- **From State**: in-progress
- **To State**: resolved
- **Trigger**: Admin updates ticket status to resolved
- **Description**: Admin marks ticket as resolved
- **Steps**:
  - A. Ticket is in in-progress state
  - B. Admin navigates to Ticket Details screen
  - C. Admin selects "resolved" status
  - D. Admin confirms status update
- **Expected Result**: 
  - Ticket transitions to resolved state
  - Timeline entry is added with "resolved" status
  - User can see updated status in real-time
- **Test Cases**: Update Ticket Status
- **Priority**: High

### ST3.4: Valid Transition - Any State to Closed
- **From State**: open / in-progress / resolved
- **To State**: closed
- **Trigger**: Admin closes the ticket
- **Description**: Admin closes ticket (terminal state)
- **Steps**:
  - A. Ticket is in any state (open, in-progress, or resolved)
  - B. Admin navigates to Ticket Details screen
  - C. Admin selects "closed" status
  - D. Admin confirms status update
- **Expected Result**: 
  - Ticket transitions to closed state
  - Timeline entry is added with "closed" status
  - Ticket cannot be reopened
- **Test Cases**: Update Ticket Status
- **Priority**: Medium

---

## ST4: Shopping Cart State Machine

### State Diagram:
```
Empty → Has Items → Checkout → Order Placed → Empty
  ↓         ↓
Sign Out  Remove All Items
```

### States:
- **Empty**: Cart has no items
- **Has Items**: Cart contains one or more items
- **Checkout**: User is in checkout process
- **Order Placed**: Order has been successfully placed

### ST4.1: Valid Transition - Empty to Has Items
- **From State**: Empty
- **To State**: Has Items
- **Trigger**: User adds product to cart
- **Description**: User adds first item to cart
- **Steps**:
  - A. Cart is in Empty state
  - B. User navigates to Product Details screen
  - C. User taps "Add to Cart" button
- **Expected Result**: 
  - Cart transitions to Has Items state
  - Cart count increases to 1
  - Cart icon shows item count
  - Success message displayed
- **Test Cases**: Add to Cart
- **Priority**: High

### ST4.4: Valid Transition - Has Items to Checkout
- **From State**: Has Items
- **To State**: Checkout
- **Trigger**: User proceeds to checkout
- **Description**: User taps checkout button
- **Steps**:
  - A. Cart is in Has Items state
  - B. User navigates to Cart screen
  - C. User taps "Checkout" or "Proceed to Checkout" button
- **Expected Result**: 
  - Cart transitions to Checkout state
  - User is redirected to Checkout screen
  - Cart items are displayed for review
- **Test Cases**: Checkout Process
- **Priority**: High

### ST4.5: Valid Transition - Checkout to Order Placed
- **From State**: Checkout
- **To State**: Order Placed
- **Trigger**: User successfully places order
- **Description**: User completes checkout and order is placed
- **Steps**:
  - A. Cart is in Checkout state
  - B. User selects shipping address
  - C. User selects payment method
  - D. User taps "Place Order" button
  - E. Order is successfully created
- **Expected Result**: 
  - Cart transitions to Order Placed state
  - Order is created in database
  - User is redirected to Order Confirmation screen
- **Test Cases**: Place Order
- **Priority**: High

### ST4.6: Valid Transition - Order Placed to Empty
- **From State**: Order Placed
- **To State**: Empty
- **Trigger**: Order is successfully placed
- **Description**: Cart is cleared after order placement
- **Steps**:
  - A. Cart is in Order Placed state
  - B. Order is successfully created
  - C. Cart is cleared
- **Expected Result**: 
  - Cart transitions to Empty state
  - All cart items are removed
  - Cart count becomes 0
  - User can start new shopping session
- **Test Cases**: Place Order
- **Priority**: High

### ST4.8: Invalid Transition - Empty to Checkout
- **From State**: Empty
- **To State**: Checkout (invalid)
- **Trigger**: User attempts to checkout with empty cart
- **Description**: User tries to proceed to checkout with no items
- **Steps**:
  - A. Cart is in Empty state
  - B. User attempts to navigate to Checkout screen
- **Expected Result**: 
  - Transition is blocked
  - User cannot access Checkout screen
  - Error message displayed: "Cart is empty"
  - Cart remains in Empty state
- **Test Cases**: Checkout Validation
- **Priority**: High

---

## ST5: Product Stock State Machine

### State Diagram:
```
In Stock (stock > 0) → Out of Stock (stock = 0)
         ↑                      ↓
    Admin Updates Stock    Admin Updates Stock
```

### States:
- **In Stock**: Product has available stock (stock > 0)
- **Out of Stock**: Product has no available stock (stock = 0)

### ST5.1: Valid Transition - In Stock to Out of Stock (Stock Depletion)
- **From State**: In Stock
- **To State**: Out of Stock
- **Trigger**: Stock reaches zero (through orders or admin update)
- **Description**: Product stock is depleted to zero
- **Steps**:
  - A. Product is in In Stock state (e.g., stock = 5)
  - B. Multiple orders are placed, reducing stock to 0
  - OR Admin updates stock to 0
- **Expected Result**: 
  - Product transitions to Out of Stock state
  - "Add to Cart" button is disabled
  - "Out of Stock" label is displayed
  - Users cannot add product to cart
- **Test Cases**: Stock Management, Place Order
- **Priority**: High

### ST5.2: Valid Transition - Out of Stock to In Stock (Stock Restock)
- **From State**: Out of Stock
- **To State**: In Stock
- **Trigger**: Admin updates stock to positive value
- **Description**: Admin restocks product
- **Steps**:
  - A. Product is in Out of Stock state (stock = 0)
  - B. Admin navigates to Product Edit screen
  - C. Admin updates stock to positive value (e.g., 10)
  - D. Admin saves changes
- **Expected Result**: 
  - Product transitions to In Stock state
  - "Add to Cart" button is enabled
  - "Out of Stock" label is removed
  - Users can add product to cart
- **Test Cases**: Update Product Stock
- **Priority**: High

---

## ST6: Email Verification State Machine

### State Diagram:
```
Unverified → Verification Email Sent → Verified
     ↓              ↓
  Resend Email   Expired/Invalid Link
```

### States:
- **Unverified**: User email is not verified
- **Verification Email Sent**: Verification email has been sent
- **Verified**: User email is verified

### ST6.1: Valid Transition - Unverified to Verification Email Sent
- **From State**: Unverified
- **To State**: Verification Email Sent
- **Trigger**: User signs up or requests verification email
- **Description**: System sends verification email to user
- **Steps**:
  - A. User is in Unverified state
  - B. User signs up with email/password
  - OR User requests resend verification email
- **Expected Result**: 
  - User transitions to Verification Email Sent state
  - Verification email is sent to user's inbox
  - User sees message to check email
- **Test Cases**: Sign Up, Resend Verification Email
- **Priority**: High

### ST6.2: Valid Transition - Verification Email Sent to Verified
- **From State**: Verification Email Sent
- **To State**: Verified
- **Trigger**: User clicks verification link in email
- **Description**: User verifies email by clicking link
- **Steps**:
  - A. User is in Verification Email Sent state
  - B. User receives verification email
  - C. User clicks verification link
  - D. User returns to app
  - E. App checks verification status
- **Expected Result**: 
  - User transitions to Verified state
  - Email verification status is updated
  - User can access authenticated features
- **Test Cases**: Email Verification
- **Priority**: High

---

## ST9: Wishlist State Machine

### State Diagram:
```
Product Not in Wishlist → Product in Wishlist
         ↑                        ↓
    Remove from Wishlist    Add to Wishlist
```

### States:
- **Product Not in Wishlist**: Product is not in user's wishlist
- **Product in Wishlist**: Product is in user's wishlist

### ST9.1: Valid Transition - Product Not in Wishlist to Product in Wishlist
- **From State**: Product Not in Wishlist
- **To State**: Product in Wishlist
- **Trigger**: User adds product to wishlist
- **Description**: User adds product to their wishlist
- **Steps**:
  - A. Product is in Product Not in Wishlist state
  - B. User navigates to Product Details screen
  - C. User taps wishlist/heart icon
- **Expected Result**: 
  - Product transitions to Product in Wishlist state
  - Wishlist icon changes to filled state
  - Product is added to wishlist
  - Product appears in Wishlist screen
- **Test Cases**: Add Product to Wishlist
- **Priority**: High

### ST9.2: Valid Transition - Product in Wishlist to Product Not in Wishlist
- **From State**: Product in Wishlist
- **To State**: Product Not in Wishlist
- **Trigger**: User removes product from wishlist
- **Description**: User removes product from their wishlist
- **Steps**:
  - A. Product is in Product in Wishlist state
  - B. User navigates to Product Details screen or Wishlist screen
  - C. User taps wishlist/heart icon (filled state)
- **Expected Result**: 
  - Product transitions to Product Not in Wishlist state
  - Wishlist icon changes to unfilled state
  - Product is removed from wishlist
  - Product no longer appears in Wishlist screen
- **Test Cases**: Remove Product from Wishlist
- **Priority**: High

---

## ST10: Notification State Machine

### State Diagram:
```
Unread → Read
  ↑       ↓
Mark as Unread (if supported)
```

### States:
- **Unread**: Notification has not been read
- **Read**: Notification has been read

### ST10.1: Valid Transition - Unread to Read
- **From State**: Unread
- **To State**: Read
- **Trigger**: User views notification or marks as read
- **Description**: User reads a notification
- **Steps**:
  - A. Notification is in Unread state
  - B. User navigates to Notifications screen
  - C. User taps on notification
  - OR User taps "Mark All as Read" button
- **Expected Result**: 
  - Notification transitions to Read state
  - Unread count decreases
  - Notification is marked as read
- **Test Cases**: Mark Notifications as Read
- **Priority**: Medium

---

## ST11: User Role State Machine

### State Diagram:
```
user → admin
  ↑      ↓
  └──────┘ (admin can change roles)
```

### States:
- **user**: Regular user role
- **admin**: Administrator role

### ST11.1: Valid Transition - User to Admin
- **From State**: user
- **To State**: admin
- **Trigger**: Admin updates user role to admin
- **Description**: Admin promotes a user to admin role
- **Steps**:
  - A. User is in user state
  - B. Admin navigates to User Details screen
  - C. Admin selects "admin" role
  - D. Admin confirms role change
- **Expected Result**: 
  - User transitions to admin state
  - User gains admin access immediately
  - User can access admin features
  - Changes are reflected in real-time
- **Test Cases**: Update User Role
- **Priority**: High

### ST11.2: Valid Transition - Admin to User
- **From State**: admin
- **To State**: user
- **Trigger**: Admin updates user role to user
- **Description**: Admin demotes an admin to user role
- **Steps**:
  - A. User is in admin state
  - B. Admin navigates to User Details screen
  - C. Admin selects "user" role
  - D. Admin confirms role change
- **Expected Result**: 
  - User transitions to user state
  - Admin access is revoked immediately
  - User can no longer access admin features
  - Changes are reflected in real-time
- **Test Cases**: Update User Role
- **Priority**: High

---

## ST12: AR View State Machine

### State Diagram:
```
Camera Permission: Not Granted → Requesting → Granted / Denied
Tracking: Unknown → Ready / Limited / Unavailable
Model: Not Loaded → Loading → Loaded / Error
Plane Detection: Not Detected → Detecting → Detected → Locked
Model Placement: Not Placed → Placing → Placed
```

### States:
- **Camera Permission Not Granted**: Camera permission has not been requested or was denied
- **Camera Permission Requesting**: Camera permission request is in progress
- **Camera Permission Granted**: Camera permission has been granted
- **Camera Permission Denied**: Camera permission has been denied
- **Tracking Unknown**: AR tracking state is unknown
- **Tracking Ready**: AR tracking is ready and working
- **Tracking Limited**: AR tracking is limited (poor lighting, movement, etc.)
- **Tracking Unavailable**: AR tracking is unavailable
- **Model Not Loaded**: 3D model has not been loaded
- **Model Loading**: 3D model is currently loading
- **Model Loaded**: 3D model has been successfully loaded
- **Model Error**: Error occurred while loading model
- **Plane Not Detected**: No plane/surface has been detected
- **Plane Detecting**: System is detecting planes/surfaces
- **Plane Detected**: A plane/surface has been detected
- **Plane Locked**: Plane detection is locked (after placement)
- **Model Not Placed**: Model has not been placed in AR space
- **Model Placing**: Model placement is in progress
- **Model Placed**: Model has been successfully placed in AR space

### ST12.1: Valid Transition - Camera Permission Not Granted to Requesting
- **From State**: Camera Permission Not Granted
- **To State**: Camera Permission Requesting
- **Trigger**: User opens AR view and system requests camera permission
- **Description**: System requests camera permission when AR view is accessed
- **Steps**:
  - A. User is in Camera Permission Not Granted state
  - B. User navigates to Product Details screen
  - C. User taps "View in AR" button
  - D. System requests camera permission
- **Expected Result**: 
  - User transitions to Camera Permission Requesting state
  - Permission dialog is displayed
  - System waits for user response
- **Test Cases**: AR View Access, Camera Permission
- **Priority**: High

### ST12.2: Valid Transition - Camera Permission Requesting to Granted
- **From State**: Camera Permission Requesting
- **To State**: Camera Permission Granted
- **Trigger**: User grants camera permission
- **Description**: User allows camera access in permission dialog
- **Steps**:
  - A. User is in Camera Permission Requesting state
  - B. Permission dialog is displayed
  - C. User taps "Allow" or "Grant" button
- **Expected Result**: 
  - User transitions to Camera Permission Granted state
  - AR view initializes
  - Camera feed is displayed
  - AR tracking begins
- **Test Cases**: Camera Permission
- **Priority**: High

### ST12.3: Valid Transition - Camera Permission Requesting to Denied
- **From State**: Camera Permission Requesting
- **To State**: Camera Permission Denied
- **Trigger**: User denies camera permission
- **Description**: User denies camera access in permission dialog
- **Steps**:
  - A. User is in Camera Permission Requesting state
  - B. Permission dialog is displayed
  - C. User taps "Deny" or "Don't Allow" button
- **Expected Result**: 
  - User transitions to Camera Permission Denied state
  - AR view cannot initialize
  - Error message displayed: "Camera permission is required for AR view"
  - User is redirected back to Product Details
- **Test Cases**: Camera Permission
- **Priority**: High

### ST12.4: Valid Transition - Tracking Unknown to Ready
- **From State**: Tracking Unknown
- **To State**: Tracking Ready
- **Trigger**: AR tracking system initializes successfully
- **Description**: AR tracking becomes ready after camera permission is granted
- **Steps**:
  - A. User is in Tracking Unknown state
  - B. Camera permission is granted
  - C. AR view initializes
  - D. System detects sufficient lighting and features
- **Expected Result**: 
  - User transitions to Tracking Ready state
  - AR tracking is active
  - Plane detection begins
  - Reticle appears when surface is detected
- **Test Cases**: AR Tracking
- **Priority**: High

### ST12.5: Valid Transition - Tracking Ready to Limited
- **From State**: Tracking Ready
- **To State**: Tracking Limited
- **Trigger**: AR tracking conditions degrade (poor lighting, fast movement)
- **Description**: AR tracking quality degrades due to environmental conditions
- **Steps**:
  - A. User is in Tracking Ready state
  - B. User moves device too quickly
  - OR Lighting conditions become poor
  - OR Device moves to featureless area
- **Expected Result**: 
  - User transitions to Tracking Limited state
  - Warning message displayed: "Tracking limited - improve lighting or slow movement"
  - Plane detection may be less accurate
  - Model placement may be disabled until tracking improves
- **Test Cases**: AR Tracking
- **Priority**: Medium

### ST12.6: Valid Transition - Tracking Limited to Ready
- **From State**: Tracking Limited
- **To State**: Tracking Ready
- **Trigger**: AR tracking conditions improve
- **Description**: AR tracking quality improves when conditions are better
- **Steps**:
  - A. User is in Tracking Limited state
  - B. User improves lighting conditions
  - OR User slows device movement
  - OR User moves to area with more features
- **Expected Result**: 
  - User transitions to Tracking Ready state
  - Warning message is cleared
  - Plane detection becomes more accurate
  - Model placement is enabled
- **Test Cases**: AR Tracking
- **Priority**: Medium

### ST12.7: Valid Transition - Model Not Loaded to Loading
- **From State**: Model Not Loaded
- **To State**: Model Loading
- **Trigger**: User opens AR view and system starts loading 3D model
- **Description**: System begins loading 3D model from Firebase Storage
- **Steps**:
  - A. User is in Model Not Loaded state
  - B. User navigates to AR View screen
  - C. Product has a valid 3D model URL
  - D. System starts downloading model
- **Expected Result**: 
  - User transitions to Model Loading state
  - Loading indicator is displayed
  - Loading progress is shown (0-100%)
  - Model download begins
- **Test Cases**: AR Model Loading
- **Priority**: High

### ST12.8: Valid Transition - Model Loading to Loaded
- **From State**: Model Loading
- **To State**: Model Loaded
- **Trigger**: 3D model successfully downloads and loads
- **Description**: 3D model finishes loading successfully
- **Steps**:
  - A. User is in Model Loading state
  - B. Model download completes
  - C. Model file is validated
  - D. Model is ready for placement
- **Expected Result**: 
  - User transitions to Model Loaded state
  - Loading indicator is hidden
  - Model is ready to be placed in AR space
  - "Place Model" button becomes enabled
- **Test Cases**: AR Model Loading
- **Priority**: High

### ST12.9: Valid Transition - Model Loading to Error
- **From State**: Model Loading
- **To State**: Model Error
- **Trigger**: Model download fails or model file is invalid
- **Description**: Error occurs while loading 3D model
- **Steps**:
  - A. User is in Model Loading state
  - B. Network connection is lost
  - OR Model URL is invalid
  - OR Model file is corrupted
  - OR Download timeout occurs
- **Expected Result**: 
  - User transitions to Model Error state
  - Loading indicator is hidden
  - Error message displayed: "Failed to load model. Please check your connection and try again."
  - Retry button is displayed
- **Test Cases**: AR Model Loading
- **Priority**: High

### ST12.10: Valid Transition - Plane Not Detected to Detecting
- **From State**: Plane Not Detected
- **To State**: Plane Detecting
- **Trigger**: AR tracking is ready and system starts detecting surfaces
- **Description**: System begins detecting planes/surfaces in the environment
- **Steps**:
  - A. User is in Plane Not Detected state
  - B. Tracking is in Ready state
  - C. User points camera at a surface
  - D. System starts analyzing camera feed for planes
- **Expected Result**: 
  - User transitions to Plane Detecting state
  - System analyzes camera feed
  - Reticle appears when potential surface is detected
  - User is prompted to move camera slowly
- **Test Cases**: AR Plane Detection
- **Priority**: High

### ST12.11: Valid Transition - Plane Detecting to Detected
- **From State**: Plane Detecting
- **To State**: Plane Detected
- **Trigger**: System successfully detects a valid plane/surface
- **Description**: System identifies a suitable surface for model placement
- **Steps**:
  - A. User is in Plane Detecting state
  - B. User points camera at a flat surface (table, floor, etc.)
  - C. System detects sufficient features and plane geometry
  - D. Surface is validated as suitable for placement
- **Expected Result**: 
  - User transitions to Plane Detected state
  - Reticle appears on detected surface
  - Reticle color changes to green (ready)
  - "Place Model" button becomes enabled
- **Test Cases**: AR Plane Detection
- **Priority**: High

### ST12.12: Valid Transition - Plane Detected to Locked
- **From State**: Plane Detected
- **To State**: Plane Locked
- **Trigger**: User places model on detected plane
- **Description**: Plane detection is locked after model placement to prevent jitter
- **Steps**:
  - A. User is in Plane Detected state
  - B. User taps "Place Model" button
  - C. Model is placed on detected surface
  - D. System locks plane detection
- **Expected Result**: 
  - User transitions to Plane Locked state
  - Plane detection stops updating
  - Model position is fixed
  - User can now interact with placed model
- **Test Cases**: AR Model Placement
- **Priority**: High

### ST12.13: Valid Transition - Model Not Placed to Placing
- **From State**: Model Not Placed
- **To State**: Model Placing
- **Trigger**: User taps "Place Model" button
- **Description**: User initiates model placement in AR space
- **Steps**:
  - A. User is in Model Not Placed state
  - B. Model is loaded
  - C. Plane is detected
  - D. User taps "Place Model" button
- **Expected Result**: 
  - User transitions to Model Placing state
  - Model appears at reticle position
  - Placement animation begins
  - System validates placement
- **Test Cases**: AR Model Placement
- **Priority**: High

### ST12.14: Valid Transition - Model Placing to Placed
- **From State**: Model Placing
- **To State**: Model Placed
- **Trigger**: Model placement completes successfully
- **Description**: Model is successfully placed in AR space
- **Steps**:
  - A. User is in Model Placing state
  - B. Model appears at reticle position
  - C. Placement validation succeeds
  - D. Model is anchored to detected surface
- **Expected Result**: 
  - User transitions to Model Placed state
  - Model is visible in AR space
  - Plane detection is locked
  - Model controls (scale, rotate, reset) become available
  - Reticle is hidden
- **Test Cases**: AR Model Placement
- **Priority**: High

### ST12.15: Invalid Transition - Model Placing to Error (Placement Failed)
- **From State**: Model Placing
- **To State**: Model Not Placed (with error)
- **Trigger**: Model placement fails (no surface, unstable surface)
- **Description**: Model placement fails due to invalid conditions
- **Steps**:
  - A. User is in Model Placing state
  - B. User taps "Place Model" button
  - C. No surface is detected
  - OR Surface is not stable enough
- **Expected Result**: 
  - User transitions back to Model Not Placed state
  - Error message displayed: "No surface found yet. Move your camera to scan until the reticle appears."
  - OR "Surface not stable yet. Keep scanning until the reticle stabilizes."
  - Model is not placed
  - User can retry placement
- **Test Cases**: AR Model Placement
- **Priority**: High

### ST12.16: Valid Transition - Model Placed to Model Not Placed (Reset)
- **From State**: Model Placed
- **To State**: Model Not Placed
- **Trigger**: User taps "Reset" button
- **Description**: User resets AR view and removes placed model
- **Steps**:
  - A. User is in Model Placed state
  - B. User taps "Reset" button
  - C. User confirms reset
- **Expected Result**: 
  - User transitions to Model Not Placed state
  - Model is removed from AR space
  - Plane detection is unlocked
  - Reticle reappears
  - Model position is reset to default
- **Test Cases**: AR Model Controls
- **Priority**: Medium

### ST12.17: Invalid Transition - Model Not Loaded to Model Placed (Without Loading)
- **From State**: Model Not Loaded
- **To State**: Model Placed (invalid)
- **Trigger**: User attempts to place model before it loads
- **Description**: User tries to place model that hasn't been loaded yet
- **Steps**:
  - A. User is in Model Not Loaded state
  - B. User navigates to AR View screen
  - C. User attempts to tap "Place Model" button
- **Expected Result**: 
  - Transition is blocked
  - "Place Model" button is disabled
  - Error message displayed: "Model is still loading. Please wait."
  - User remains in Model Not Loaded state
- **Test Cases**: AR Model Placement Validation
- **Priority**: High

### ST12.18: Invalid Transition - Camera Permission Denied to AR View Active
- **From State**: Camera Permission Denied
- **To State**: AR View Active (invalid)
- **Trigger**: User attempts to use AR view without camera permission
- **Description**: User tries to access AR features without granting camera permission
- **Steps**:
  - A. User is in Camera Permission Denied state
  - B. User attempts to open AR view
  - C. User attempts to interact with AR features
- **Expected Result**: 
  - Transition is blocked
  - AR view cannot initialize
  - Error message displayed: "Camera permission is required for AR view"
  - User is prompted to grant permission in settings
  - User remains in Camera Permission Denied state
- **Test Cases**: AR Camera Permission
- **Priority**: High

---

## Summary

This document covers the most important state machines and their transitions in the Shop360 mobile app, focusing on core functional requirements. State transition testing ensures that:

1. **Valid Transitions Work**: All allowed state changes function correctly
2. **Invalid Transitions Are Blocked**: Unauthorized state changes are prevented
3. **State Persistence**: States are correctly saved and restored
4. **Real-time Updates**: State changes are reflected across the app in real-time
5. **Business Rules**: State transitions follow business logic and constraints

### Key State Machines Covered:

1. **User Authentication**: Guest → Unverified → Verified (Registration, Login, Logout, RBAC)
2. **Order Status**: Processing → Shipped → Delivered / Cancellation flow
3. **Ticket Status**: Open → In-Progress → Resolved / Closed (Chat with vendor)
4. **Shopping Cart**: Empty → Has Items → Checkout → Order Placed
5. **Product Stock**: In Stock ↔ Out of Stock (Product Management - Admin)
6. **Email Verification**: Unverified → Verification Sent → Verified (Authentication)
7. **Wishlist**: Not in Wishlist ↔ In Wishlist (Wishlist Management)
8. **Notifications**: Unread → Read (Push Notifications)
9. **User Role**: User ↔ Admin (Role Based Access Control)
10. **AR View**: Camera Permission → Tracking → Model Loading → Plane Detection → Model Placement (AR Product Preview)

### State Transition Testing Benefits:

1. **Comprehensive Coverage**: Tests all possible state changes
2. **Error Detection**: Identifies invalid transitions and state corruption
3. **Business Logic Validation**: Ensures state machines follow business rules
4. **Real-time Sync Testing**: Verifies state changes sync across devices
5. **Edge Case Discovery**: Finds unexpected state transition scenarios

Each state transition test case includes:
- **From State**: Current state before transition
- **To State**: Target state after transition
- **Trigger**: Action that causes the transition
- **Description**: Explanation of the transition
- **Steps**: Detailed steps to execute the transition
- **Expected Result**: What should happen during/after transition
- **Test Cases**: Which scenarios use this transition
- **Priority**: Importance level for testing

### Total Test Cases: 45

**Breakdown:**
- ST1: User Authentication - 5 test cases
- ST2: Order Status - 5 test cases
- ST3: Support Ticket Status - 3 test cases
- ST4: Shopping Cart - 5 test cases
- ST5: Product Stock - 2 test cases
- ST6: Email Verification - 2 test cases
- ST9: Wishlist - 2 test cases
- ST10: Notifications - 1 test case
- ST11: User Role - 2 test cases
- ST12: AR View - 18 test cases