# Shop360 Mobile App - Equivalence Partition Test Cases

## Overview

Equivalence Partitioning is a black-box testing technique where input data is divided into equivalent partitions (groups) that are expected to be handled the same way by the application. This document describes all equivalence partitions for inputs in the Shop360 mobile app.

---

## EP1: Email Address Input

### EP1.1: Valid Email Format
- **Partition**: Valid email addresses with proper format
- **Description**: Email addresses containing @ symbol, valid domain, and proper structure
- **Valid Examples**: 
  - `user@example.com`
  - `test.user@domain.co.uk`
  - `user123@test-domain.com`
- **Expected Result**: Email is accepted and processed successfully
- **Test Cases**: Sign Up, Sign In, Change Email, Password Reset

### EP1.2: Invalid Email Format (Missing @)
- **Partition**: Email addresses without @ symbol
- **Description**: Strings that look like emails but lack the @ symbol
- **Invalid Examples**: 
  - `userexample.com`
  - `test.userdomain.com`
  - `user123test-domain.com`
- **Expected Result**: System rejects input with error message "Invalid email format"
- **Test Cases**: Sign Up, Sign In, Change Email, Password Reset

### EP1.3: Invalid Email Format (Missing Domain)
- **Partition**: Email addresses without domain part
- **Description**: Email addresses that have @ but no domain after it
- **Invalid Examples**: 
  - `user@`
  - `test@.com`
  - `user@domain`
- **Expected Result**: System rejects input with error message "Invalid email format"
- **Test Cases**: Sign Up, Sign In, Change Email, Password Reset

### EP1.4: Empty Email
- **Partition**: Empty string or whitespace-only email
- **Description**: No email address provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Email is required"
- **Test Cases**: Sign Up, Sign In, Change Email, Password Reset

### EP1.5: Email Already in Use
- **Partition**: Email address that already exists in the system
- **Description**: Email address that is already registered
- **Invalid Examples**: 
  - `existing@example.com` (if already registered)
- **Expected Result**: System rejects sign up with error message "Email already in use"
- **Test Cases**: Sign Up

---

## EP2: Password Input

### EP2.1: Valid Password (Minimum Length)
- **Partition**: Passwords with 6 or more characters
- **Description**: Passwords meeting minimum length requirement
- **Valid Examples**: 
  - `Test123!` (8 characters)
  - `Pass12` (6 characters - minimum)
  - `VeryLongPassword123!@#` (20+ characters)
- **Expected Result**: Password is accepted and processed successfully
- **Test Cases**: Sign Up, Sign In, Change Password

### EP2.2: Invalid Password (Too Short)
- **Partition**: Passwords with less than 6 characters
- **Description**: Passwords that do not meet minimum length requirement
- **Invalid Examples**: 
  - `Test1` (5 characters)
  - `Pass` (4 characters)
  - `Ab1` (3 characters)
  - `A` (1 character)
- **Expected Result**: System rejects input with error message "Password must be at least 6 characters"
- **Test Cases**: Sign Up, Change Password

### EP2.3: Empty Password
- **Partition**: Empty string or whitespace-only password
- **Description**: No password provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Password is required"
- **Test Cases**: Sign Up, Sign In, Change Password

### EP2.4: Weak Password
- **Partition**: Passwords that are too weak (Firebase validation)
- **Description**: Passwords that Firebase considers weak
- **Invalid Examples**: 
  - `123456` (all numbers)
  - `abcdef` (all letters, no numbers)
  - `password` (common word)
- **Expected Result**: System rejects input with error message "The password is too weak"
- **Test Cases**: Sign Up, Change Password

### EP2.5: Password Mismatch
- **Partition**: Password and confirm password do not match
- **Description**: When password and confirm password fields have different values
- **Invalid Examples**: 
  - Password: `Test123!`, Confirm: `Test1234!`
  - Password: `Pass123`, Confirm: `Pass456`
- **Expected Result**: System rejects input with error message "Passwords do not match"
- **Test Cases**: Sign Up, Change Password

---

## EP3: User Name Input

### EP3.1: Valid Name
- **Partition**: Non-empty names with reasonable length
- **Description**: Names that are not empty and within acceptable length
- **Valid Examples**: 
  - `John Doe`
  - `Mary Jane Watson`
  - `A` (minimum 1 character)
  - `Very Long Name That Is Still Acceptable` (up to reasonable limit)
- **Expected Result**: Name is accepted and saved successfully
- **Test Cases**: Sign Up, Update Name

### EP3.2: Empty Name
- **Partition**: Empty string or whitespace-only name
- **Description**: No name provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Name is required"
- **Test Cases**: Sign Up, Update Name

---

## EP4: Product Quantity Input

### EP4.1: Valid Quantity (Within Stock)
- **Partition**: Quantities between 1 and available stock
- **Description**: Quantities that are positive and do not exceed available stock
- **Valid Examples**: 
  - Quantity: `1` (minimum)
  - Quantity: `5` (if stock >= 5)
  - Quantity: `10` (if stock >= 10)
  - Quantity: `stock` (exactly equal to stock)
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity

### EP4.2: Invalid Quantity (Zero)
- **Partition**: Quantity of zero
- **Description**: Zero quantity is not allowed
- **Invalid Examples**: 
  - Quantity: `0`
- **Expected Result**: System prevents setting quantity to zero, minimum quantity is 1
- **Test Cases**: Update Cart Quantity

### EP4.3: Invalid Quantity (Negative)
- **Partition**: Negative quantity values
- **Description**: Negative numbers are not valid quantities
- **Invalid Examples**: 
  - Quantity: `-1`
  - Quantity: `-5`
  - Quantity: `-100`
- **Expected Result**: System rejects input, quantity cannot be negative
- **Test Cases**: Update Cart Quantity

### EP4.4: Invalid Quantity (Exceeds Stock)
- **Partition**: Quantities greater than available stock
- **Description**: Quantities that exceed the available stock level
- **Invalid Examples**: 
  - Stock: `5`, Quantity: `6`
  - Stock: `10`, Quantity: `15`
  - Stock: `1`, Quantity: `2`
- **Expected Result**: System rejects input with error message "Only X item(s) available in stock"
- **Test Cases**: Add to Cart, Update Cart Quantity

### EP4.5: Invalid Quantity (Out of Stock)
- **Partition**: Attempting to add product with stock = 0
- **Description**: Products that have no available stock
- **Invalid Examples**: 
  - Stock: `0`, Attempt to add to cart
- **Expected Result**: System prevents adding to cart with error message "Product is out of stock"
- **Test Cases**: Add to Cart

---

## EP5: Product Price Input

### EP5.1: Valid Price (Positive)
- **Partition**: Positive price values
- **Description**: Prices that are greater than zero
- **Valid Examples**: 
  - Price: `10.99`
  - Price: `0.01` (minimum)
  - Price: `9999.99` (large value)
  - Price: `100` (integer)
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product

### EP5.2: Invalid Price (Zero)
- **Partition**: Price of zero
- **Description**: Zero price is not allowed for products
- **Invalid Examples**: 
  - Price: `0`
  - Price: `0.00`
- **Expected Result**: System rejects input with error message "Price must be greater than zero"
- **Test Cases**: Create Product, Edit Product

### EP5.3: Invalid Price (Negative)
- **Partition**: Negative price values
- **Description**: Negative prices are not valid
- **Invalid Examples**: 
  - Price: `-10.99`
  - Price: `-0.01`
  - Price: `-100`
- **Expected Result**: System rejects input with error message "Price cannot be negative"
- **Test Cases**: Create Product, Edit Product

### EP5.4: Invalid Price (Empty)
- **Partition**: Empty price field
- **Description**: No price provided
- **Invalid Examples**: 
  - Price: `""` (empty string)
  - Price: `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Price is required"
- **Test Cases**: Create Product, Edit Product

---

## EP6: Product Stock Input

### EP6.1: Valid Stock (Positive)
- **Partition**: Positive stock values including zero
- **Description**: Stock values that are zero or positive integers
- **Valid Examples**: 
  - Stock: `0` (out of stock - valid state)
  - Stock: `1` (minimum in stock)
  - Stock: `10`
  - Stock: `1000` (large value)
- **Expected Result**: Stock is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product, Update Stock

### EP6.2: Invalid Stock (Negative)
- **Partition**: Negative stock values
- **Description**: Negative stock is not valid
- **Invalid Examples**: 
  - Stock: `-1`
  - Stock: `-5`
  - Stock: `-100`
- **Expected Result**: System rejects input with error message "Stock cannot be negative"
- **Test Cases**: Create Product, Edit Product, Update Stock

### EP6.3: Invalid Stock (Non-Integer)
- **Partition**: Decimal or non-numeric stock values
- **Description**: Stock must be an integer value
- **Invalid Examples**: 
  - Stock: `10.5`
  - Stock: `abc`
  - Stock: `12.99`
- **Expected Result**: System rejects input with error message "Stock must be a whole number"
- **Test Cases**: Create Product, Edit Product, Update Stock

### EP6.4: Invalid Stock (Empty)
- **Partition**: Empty stock field
- **Description**: No stock value provided
- **Invalid Examples**: 
  - Stock: `""` (empty string)
  - Stock: `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Stock is required"
- **Test Cases**: Create Product, Edit Product

---

## EP7: Payment Card Number Input

### EP7.1: Valid Card Number (16 Digits)
- **Partition**: Valid 16-digit card numbers for Visa/Mastercard/Discover
- **Description**: Card numbers with exactly 16 digits that pass Luhn algorithm
- **Valid Examples**: 
  - `4111111111111111` (Visa test)
  - `5555555555554444` (Mastercard test)
  - `6011111111111117` (Discover test)
- **Expected Result**: Card number is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP7.2: Valid Card Number (15 Digits - Amex)
- **Partition**: Valid 15-digit card numbers for American Express
- **Description**: Card numbers with exactly 15 digits for Amex
- **Valid Examples**: 
  - `378282246310005` (Amex test)
  - `371449635398431` (Amex test)
- **Expected Result**: Card number is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP7.3: Invalid Card Number (Too Short)
- **Partition**: Card numbers with less than required digits
- **Description**: Card numbers that are too short
- **Invalid Examples**: 
  - `1234` (4 digits)
  - `123456789` (9 digits - too short for 16-digit cards)
  - `123456789012` (12 digits - too short)
- **Expected Result**: System rejects input with error message "Invalid card number"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP7.4: Invalid Card Number (Too Long)
- **Partition**: Card numbers with more than required digits
- **Description**: Card numbers that exceed the maximum length
- **Invalid Examples**: 
  - `12345678901234567` (17 digits - too long for 16-digit cards)
  - `123456789012345678` (18 digits)
- **Expected Result**: System rejects input with error message "Invalid card number"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP7.5: Invalid Card Number (Invalid Format)
- **Partition**: Card numbers that fail Luhn algorithm validation
- **Description**: Card numbers with correct length but invalid checksum
- **Invalid Examples**: 
  - `4111111111111112` (fails Luhn check)
  - `5555555555554445` (fails Luhn check)
- **Expected Result**: System rejects input with error message "Invalid card number"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP7.6: Invalid Card Number (Non-Numeric)
- **Partition**: Card numbers containing non-numeric characters
- **Description**: Card numbers with letters or special characters
- **Invalid Examples**: 
  - `4111-1111-1111-1111` (contains hyphens)
  - `4111 1111 1111 1111` (contains spaces)
  - `abc1234567890123` (contains letters)
- **Expected Result**: System rejects input with error message "Card number must contain only digits"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP7.7: Empty Card Number
- **Partition**: Empty card number field
- **Description**: No card number provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Card number is required"
- **Test Cases**: Add Payment Card, Edit Payment Card

---

## EP8: CVV (Card Verification Value) Input

### EP8.1: Valid CVV (3 Digits - Visa/Mastercard/Discover)
- **Partition**: Valid 3-digit CVV for most card types
- **Description**: CVV with exactly 3 digits
- **Valid Examples**: 
  - `123`
  - `456`
  - `000`
  - `999`
- **Expected Result**: CVV is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP8.2: Valid CVV (4 Digits - Amex)
- **Partition**: Valid 4-digit CVV for American Express
- **Description**: CVV with exactly 4 digits for Amex cards
- **Valid Examples**: 
  - `1234`
  - `5678`
  - `0000`
- **Expected Result**: CVV is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP8.3: Invalid CVV (Too Short)
- **Partition**: CVV with less than required digits
- **Description**: CVV that is too short
- **Invalid Examples**: 
  - `12` (2 digits - too short for 3-digit requirement)
  - `1` (1 digit)
- **Expected Result**: System rejects input with error message "CVV is required (3 digits)" or "CVV is required (4 digits)"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP8.4: Invalid CVV (Too Long)
- **Partition**: CVV with more than required digits
- **Description**: CVV that exceeds the maximum length
- **Invalid Examples**: 
  - `1234` (4 digits for non-Amex card - too long)
  - `12345` (5 digits)
- **Expected Result**: System rejects input with error message "CVV must be 3 digits" or "CVV must be 4 digits"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP8.5: Invalid CVV (Non-Numeric)
- **Partition**: CVV containing non-numeric characters
- **Description**: CVV with letters or special characters
- **Invalid Examples**: 
  - `12a` (contains letter)
  - `12-3` (contains hyphen)
  - `abc` (all letters)
- **Expected Result**: System rejects input with error message "CVV must contain only digits"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP8.6: Empty CVV
- **Partition**: Empty CVV field
- **Description**: No CVV provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "CVV is required"
- **Test Cases**: Add Payment Card, Edit Payment Card

---

## EP9: Card Expiry Date Input

### EP9.1: Valid Expiry Month (1-12)
- **Partition**: Valid month values between 1 and 12
- **Description**: Month values that are within valid range
- **Valid Examples**: 
  - `01` or `1` (January)
  - `06` or `6` (June)
  - `12` (December)
- **Expected Result**: Expiry month is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP9.2: Invalid Expiry Month (Zero)
- **Partition**: Month value of zero
- **Description**: Zero is not a valid month
- **Invalid Examples**: 
  - `0`
  - `00`
- **Expected Result**: System rejects input with error message "Invalid expiry month (must be 1-12)"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP9.3: Invalid Expiry Month (Greater Than 12)
- **Partition**: Month values greater than 12
- **Description**: Months that exceed the maximum value
- **Invalid Examples**: 
  - `13`
  - `25`
  - `99`
- **Expected Result**: System rejects input with error message "Invalid expiry month (must be 1-12)"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP9.4: Valid Expiry Year (Current or Future)
- **Partition**: Expiry year that is current year or future
- **Description**: Years that are not in the past
- **Valid Examples**: 
  - Current year: `24` (if current year is 2024)
  - Future year: `25`, `26`, `30`
- **Expected Result**: Expiry year is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP9.5: Invalid Expiry Year (Past Year)
- **Partition**: Expiry year that is in the past
- **Description**: Years that have already passed
- **Invalid Examples**: 
  - `20` (if current year is 2024)
  - `19`, `18`, `17` (past years)
- **Expected Result**: System rejects input with error message "Card has expired"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP9.6: Invalid Expiry Year (Current Year with Past Month)
- **Partition**: Current year but month has already passed
- **Description**: Card expired in current year
- **Invalid Examples**: 
  - Current date: March 2024, Expiry: `02/24` (February 2024 - expired)
  - Current date: December 2024, Expiry: `11/24` (November 2024 - expired)
- **Expected Result**: System rejects input with error message "Card has expired"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP9.7: Invalid Expiry Year (Wrong Format)
- **Partition**: Expiry year with incorrect format
- **Description**: Years that are not in YY format (2 digits)
- **Invalid Examples**: 
  - `2024` (4 digits instead of 2)
  - `4` (1 digit)
  - `abc` (non-numeric)
- **Expected Result**: System rejects input with error message "Expiry year is required (YY)"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP9.8: Empty Expiry Date
- **Partition**: Empty expiry month or year fields
- **Description**: No expiry date provided
- **Invalid Examples**: 
  - Month: `""`, Year: `""`
  - Month: `"   "`, Year: `"   "`
- **Expected Result**: System rejects input with error message "Expiry month is required" or "Expiry year is required"
- **Test Cases**: Add Payment Card, Edit Payment Card

---

## EP10: Cardholder Name Input

### EP10.1: Valid Cardholder Name
- **Partition**: Valid cardholder names with proper length
- **Description**: Names that are at least 2 characters and not empty
- **Valid Examples**: 
  - `John Doe`
  - `Mary Jane Watson`
  - `AB` (minimum 2 characters)
  - `Very Long Cardholder Name That Is Still Acceptable`
- **Expected Result**: Cardholder name is accepted and saved successfully
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP10.2: Invalid Cardholder Name (Too Short)
- **Partition**: Cardholder names with less than 2 characters
- **Description**: Names that are too short
- **Invalid Examples**: 
  - `A` (1 character)
  - `""` (empty string)
- **Expected Result**: System rejects input with error message "Cardholder name must be at least 2 characters"
- **Test Cases**: Add Payment Card, Edit Payment Card

### EP10.3: Invalid Cardholder Name (Empty)
- **Partition**: Empty or whitespace-only cardholder name
- **Description**: No cardholder name provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Cardholder name is required"
- **Test Cases**: Add Payment Card, Edit Payment Card

---

## EP11: AR Camera Permission State

### EP7.1: Camera Permission Granted
- **Partition**: Camera permission has been granted by user
- **Description**: User has allowed camera access for AR functionality
- **Valid Examples**: 
  - Permission status: `granted`
- **Expected Result**: AR view can initialize, camera feed is displayed, AR tracking begins (ARCore for Android)
- **Test Cases**: Access AR View, AR Product Preview

### EP7.2: Camera Permission Denied
- **Partition**: Camera permission has been denied by user
- **Description**: User has denied camera access
- **Invalid Examples**: 
  - Permission status: `denied`
  - Permission status: `blocked`
- **Expected Result**: AR view cannot initialize, error message displayed: "Camera permission is required for AR view", user is redirected back
- **Test Cases**: Access AR View, AR Product Preview

### EP7.3: Camera Permission Not Requested
- **Partition**: Camera permission has not been requested yet
- **Description**: Permission request dialog has not been shown
- **Valid Examples**: 
  - Permission status: `unknown`
  - Permission status: `not-determined`
- **Expected Result**: System requests camera permission, permission dialog is displayed
- **Test Cases**: Access AR View, AR Product Preview

---

## EP12: AR Tracking State

### EP8.1: AR Tracking Ready
- **Partition**: AR tracking is ready and working properly
- **Description**: AR system has successfully initialized and is tracking the environment
- **Valid Examples**: 
  - Tracking state: `ready`
  - Tracking state: `normal`
- **Expected Result**: AR tracking is active, plane detection works, model placement is enabled
- **Test Cases**: AR View, AR Model Placement

### EP8.2: AR Tracking Limited
- **Partition**: AR tracking is limited due to poor conditions
- **Description**: AR tracking quality is degraded due to environmental factors
- **Valid Examples**: 
  - Tracking state: `limited`
  - Tracking reason: `insufficient-features`, `excessive-motion`, `insufficient-light`
- **Expected Result**: Warning message displayed, plane detection may be less accurate, model placement may be disabled until tracking improves
- **Test Cases**: AR View, AR Model Placement

### EP8.3: AR Tracking Unavailable
- **Partition**: AR tracking is not available
- **Description**: AR tracking cannot initialize or has failed
- **Invalid Examples**: 
  - Tracking state: `unavailable`
  - Tracking state: `not-available`
  - Tracking state: `error`
- **Expected Result**: Error message displayed, AR view cannot function, user is notified of the issue
- **Test Cases**: AR View, AR Model Placement

### EP8.4: AR Tracking Unknown
- **Partition**: AR tracking state is unknown or initializing
- **Description**: AR tracking is still initializing or state is not yet determined
- **Valid Examples**: 
  - Tracking state: `unknown`
  - Tracking state: `initializing`
- **Expected Result**: System waits for tracking to initialize, loading indicator may be shown
- **Test Cases**: AR View Initialization

---

## EP13: AR Model Loading State

### EP9.1: Model Loaded Successfully
- **Partition**: 3D model has been successfully loaded
- **Description**: Model file downloaded and loaded without errors
- **Valid Examples**: 
  - Model state: `loaded`
  - Model state: `ready`
  - Loading progress: `100%`
- **Expected Result**: Model is ready for placement, "Place Model" button is enabled, model can be placed in AR space
- **Test Cases**: AR Model Loading, AR Model Placement

### EP9.2: Model Loading in Progress
- **Partition**: 3D model is currently being loaded
- **Description**: Model file is being downloaded or processed
- **Valid Examples**: 
  - Model state: `loading`
  - Loading progress: `0-99%`
- **Expected Result**: Loading indicator is displayed, progress is shown, "Place Model" button is disabled
- **Test Cases**: AR Model Loading

### EP9.3: Model Loading Error
- **Partition**: Error occurred while loading 3D model
- **Description**: Model failed to load due to network error, invalid URL, or corrupted file
- **Invalid Examples**: 
  - Model state: `error`
  - Error: `network-error`, `invalid-url`, `timeout`, `corrupted-file`
- **Expected Result**: Error message displayed, retry button shown, model cannot be placed
- **Test Cases**: AR Model Loading

### EP9.4: Model Not Loaded
- **Partition**: 3D model has not been loaded yet
- **Description**: Model loading has not started or product has no model
- **Valid Examples**: 
  - Model state: `not-loaded`
  - Model URL: `empty` or `null`
- **Expected Result**: System attempts to load model if URL exists, or shows message if no model available
- **Test Cases**: AR Model Loading

---

## EP14: AR Plane Detection State

### EP10.1: Plane Detected
- **Partition**: AR system has detected a valid plane/surface
- **Description**: A suitable surface has been identified for model placement
- **Valid Examples**: 
  - Plane state: `detected`
  - Reticle: `visible` and `green` (ready)
- **Expected Result**: Reticle appears on detected surface, "Place Model" button becomes enabled, user can place model
- **Test Cases**: AR Plane Detection, AR Model Placement

### EP10.2: Plane Detecting
- **Partition**: AR system is actively detecting planes
- **Description**: System is analyzing camera feed to find surfaces
- **Valid Examples**: 
  - Plane state: `detecting`
  - Reticle: `visible` and `white` (searching)
- **Expected Result**: Reticle appears when potential surface is detected, user is prompted to move camera slowly
- **Test Cases**: AR Plane Detection

### EP10.3: Plane Not Detected
- **Partition**: No plane/surface has been detected yet
- **Description**: System has not found a suitable surface for placement
- **Valid Examples**: 
  - Plane state: `not-detected`
  - Reticle: `not-visible`
- **Expected Result**: Reticle is not shown, "Place Model" button is disabled, user is prompted to scan environment
- **Test Cases**: AR Plane Detection

### EP10.4: Plane Locked
- **Partition**: Plane detection is locked after model placement
- **Description**: Plane detection has been locked to prevent jitter after model is placed
- **Valid Examples**: 
  - Plane state: `locked`
  - Plane locked: `true`
- **Expected Result**: Plane detection stops updating, model position is fixed, user can interact with placed model
- **Test Cases**: AR Model Placement, AR Model Controls

---

## EP15: Address Fields Input

### EP11.1: Valid Address Name
- **Partition**: Valid address name/recipient name
- **Description**: Non-empty address name
- **Valid Examples**: 
  - `John Doe`
  - `Home`
  - `Office`
  - `A` (minimum 1 character)
- **Expected Result**: Address name is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address

### EP11.2: Invalid Address Name (Empty)
- **Partition**: Empty address name field
- **Description**: No address name provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Name is required"
- **Test Cases**: Add Address, Edit Address

### EP11.3: Valid Street Address
- **Partition**: Valid street address
- **Description**: Non-empty street address
- **Valid Examples**: 
  - `123 Main Street`
  - `456 Oak Avenue, Apt 5B`
  - `A` (minimum 1 character)
- **Expected Result**: Street address is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address

### EP11.4: Invalid Street Address (Empty)
- **Partition**: Empty street address field
- **Description**: No street address provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Street address is required"
- **Test Cases**: Add Address, Edit Address

### EP11.5: Valid City
- **Partition**: Valid city name
- **Description**: Non-empty city name
- **Valid Examples**: 
  - `New York`
  - `Los Angeles`
  - `A` (minimum 1 character)
- **Expected Result**: City is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address

### EP11.6: Invalid City (Empty)
- **Partition**: Empty city field
- **Description**: No city provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "City is required"
- **Test Cases**: Add Address, Edit Address

### EP11.7: Valid State
- **Partition**: Valid state name or code
- **Description**: Non-empty state
- **Valid Examples**: 
  - `New York`
  - `NY`
  - `California`
  - `CA`
- **Expected Result**: State is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address

### EP11.8: Invalid State (Empty)
- **Partition**: Empty state field
- **Description**: No state provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "State is required"
- **Test Cases**: Add Address, Edit Address

### EP11.9: Valid Zip Code
- **Partition**: Valid zip/postal code
- **Description**: Non-empty zip code
- **Valid Examples**: 
  - `10001` (US format)
  - `SW1A 1AA` (UK format)
  - `12345-6789` (US extended format)
- **Expected Result**: Zip code is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address

### EP11.10: Invalid Zip Code (Empty)
- **Partition**: Empty zip code field
- **Description**: No zip code provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Zip code is required"
- **Test Cases**: Add Address, Edit Address

### EP11.11: Valid Country
- **Partition**: Valid country name
- **Description**: Non-empty country
- **Valid Examples**: 
  - `United States`
  - `USA`
  - `United Kingdom`
  - `UK`
- **Expected Result**: Country is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address

### EP11.12: Invalid Country (Empty)
- **Partition**: Empty country field
- **Description**: No country provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Country is required"
- **Test Cases**: Add Address, Edit Address

---

## EP16: Product Search Input

### EP12.1: Valid Search Term (With Results)
- **Partition**: Search terms that return matching products
- **Description**: Search queries that find products in the database
- **Valid Examples**: 
  - `laptop`
  - `phone`
  - `electronics`
  - `samsung`
- **Expected Result**: Search returns matching products successfully
- **Test Cases**: Search Products

### EP12.2: Valid Search Term (No Results)
- **Partition**: Search terms that return no matching products
- **Description**: Search queries that do not find any products
- **Valid Examples**: 
  - `xyzabc123nonexistent`
  - `productthatdoesnotexist`
- **Expected Result**: Search returns empty results with message "No products found"
- **Test Cases**: Search Products

### EP12.3: Empty Search Term
- **Partition**: Empty search query
- **Description**: No search term provided
- **Valid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System displays all products or clears search filter
- **Test Cases**: Search Products

### EP12.4: Valid Search Term (Special Characters)
- **Partition**: Search terms containing special characters
- **Description**: Search queries with special characters that are handled properly
- **Valid Examples**: 
  - `Samsung Galaxy S21`
  - `Google-Pixel`
  - `Product's Name`
- **Expected Result**: Search handles special characters and returns appropriate results
- **Test Cases**: Search Products

---

## EP17: Product Title/Name Input

### EP13.1: Valid Product Title
- **Partition**: Valid product titles
- **Description**: Non-empty product titles
- **Valid Examples**: 
  - `Samsung Galaxy S21 Ultra`
  - `Google Pixel 7 Pro`
  - `A` (minimum 1 character)
- **Expected Result**: Product title is accepted and saved successfully
- **Test Cases**: Create Product, Edit Product

### EP13.2: Invalid Product Title (Empty)
- **Partition**: Empty product title field
- **Description**: No product title provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Product title is required"
- **Test Cases**: Create Product, Edit Product

---

## EP18: Product Category Input

### EP14.1: Valid Category (Existing)
- **Partition**: Categories that exist in the system
- **Description**: Categories that are already created
- **Valid Examples**: 
  - `Electronics`
  - `Clothing`
  - `Home & Garden`
- **Expected Result**: Category is accepted and product is assigned successfully
- **Test Cases**: Create Product, Edit Product

### EP14.2: Invalid Category (Non-Existent)
- **Partition**: Categories that do not exist in the system
- **Description**: Categories that have not been created
- **Invalid Examples**: 
  - `NonExistentCategory`
  - `RandomCategory123`
- **Expected Result**: System rejects input with error message "Category does not exist" or prompts to create category
- **Test Cases**: Create Product, Edit Product

### EP14.3: Invalid Category (Empty)
- **Partition**: Empty category field
- **Description**: No category selected
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Category is required"
- **Test Cases**: Create Product, Edit Product

---

## EP19: Support Ticket Message Input

### EP15.1: Valid Ticket Message
- **Partition**: Valid support ticket messages
- **Description**: Non-empty ticket messages
- **Valid Examples**: 
  - `I need help with my order`
  - `Product arrived damaged`
  - `A` (minimum 1 character)
- **Expected Result**: Ticket message is accepted and ticket is created successfully
- **Test Cases**: Submit Support Ticket

### EP15.2: Invalid Ticket Message (Empty)
- **Partition**: Empty ticket message field
- **Description**: No ticket message provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Message is required"
- **Test Cases**: Submit Support Ticket

---

## EP20: Order Status Input

### EP16.1: Valid Order Status (Processing)
- **Partition**: Valid order status values
- **Description**: Order statuses that are valid in the system
- **Valid Examples**: 
  - `processing`
  - `shipped`
  - `delivered`
  - `cancelled`
- **Expected Result**: Order status is accepted and updated successfully
- **Test Cases**: Update Order Status

### EP16.2: Invalid Order Status (Invalid Value)
- **Partition**: Order status values that are not valid
- **Description**: Statuses that are not in the allowed list
- **Invalid Examples**: 
  - `pending` (if not in allowed list)
  - `completed` (if not in allowed list)
  - `invalid_status`
- **Expected Result**: System rejects input with error message "Invalid order status"
- **Test Cases**: Update Order Status

### EP16.3: Invalid Order Status (Invalid Transition)
- **Partition**: Order status transitions that are not allowed
- **Description**: Status changes that violate business rules
- **Invalid Examples**: 
  - From `delivered` to `processing` (cannot go backwards)
  - From `cancelled` to `shipped` (cancelled orders cannot be updated)
- **Expected Result**: System rejects input with error message indicating invalid status transition
- **Test Cases**: Update Order Status

---

## EP21: User Role Input

### EP17.1: Valid User Role (User)
- **Partition**: Valid user role values
- **Description**: Roles that are valid in the system
- **Valid Examples**: 
  - `user` (regular user)
  - `admin` (administrator)
- **Expected Result**: User role is accepted and updated successfully
- **Test Cases**: Update User Role

### EP17.2: Invalid User Role (Invalid Value)
- **Partition**: User role values that are not valid
- **Description**: Roles that are not in the allowed list
- **Invalid Examples**: 
  - `moderator` (if not in allowed list)
  - `guest` (if not in allowed list)
  - `invalid_role`
- **Expected Result**: System rejects input with error message "Invalid role"
- **Test Cases**: Update User Role

---

## EP22: Ticket Status Input

### EP18.1: Valid Ticket Status
- **Partition**: Valid ticket status values
- **Description**: Statuses that are valid for support tickets
- **Valid Examples**: 
  - `open`
  - `in-progress`
  - `resolved`
- **Expected Result**: Ticket status is accepted and updated successfully
- **Test Cases**: Update Ticket Status

### EP18.2: Invalid Ticket Status (Invalid Value)
- **Partition**: Ticket status values that are not valid
- **Description**: Statuses that are not in the allowed list
- **Invalid Examples**: 
  - `closed` (if not in allowed list)
  - `pending` (if not in allowed list)
  - `invalid_status`
- **Expected Result**: System rejects input with error message "Invalid ticket status"
- **Test Cases**: Update Ticket Status

---

## EP23: Category Name Input

### EP19.1: Valid Category Name
- **Partition**: Valid category names
- **Description**: Non-empty category names
- **Valid Examples**: 
  - `Electronics`
  - `Home & Garden`
  - `A` (minimum 1 character)
- **Expected Result**: Category name is accepted and category is created successfully
- **Test Cases**: Create Category, Edit Category

### EP19.2: Invalid Category Name (Empty)
- **Partition**: Empty category name field
- **Description**: No category name provided
- **Invalid Examples**: 
  - `""` (empty string)
  - `"   "` (whitespace only)
- **Expected Result**: System rejects input with error message "Category name is required"
- **Test Cases**: Create Category, Edit Category

### EP19.3: Invalid Category Name (Duplicate)
- **Partition**: Category names that already exist
- **Description**: Categories with names that are already in the system
- **Invalid Examples**: 
  - `Electronics` (if already exists)
  - `Clothing` (if already exists)
- **Expected Result**: System rejects input with error message "Category already exists"
- **Test Cases**: Create Category

---

## EP24: AR Model Scale Input

### EP20.1: Valid Model Scale (Within Range)
- **Partition**: Model scale values within valid range (0.1 to 10)
- **Description**: Scale multiplier values that are within acceptable bounds
- **Valid Examples**: 
  - Scale: `0.1` (minimum)
  - Scale: `1.0` (default/normal)
  - Scale: `5.0` (medium)
  - Scale: `10.0` (maximum)
- **Expected Result**: Model scale is applied successfully, model size changes accordingly
- **Test Cases**: AR Model Controls, AR Model Scaling

### EP20.2: Invalid Model Scale (Too Small)
- **Partition**: Model scale values below minimum (less than 0.1)
- **Description**: Scale values that are too small
- **Invalid Examples**: 
  - Scale: `0.05`
  - Scale: `0.0`
  - Scale: `-0.1`
- **Expected Result**: System clamps scale to minimum (0.1) or rejects input
- **Test Cases**: AR Model Controls, AR Model Scaling

### EP20.3: Invalid Model Scale (Too Large)
- **Partition**: Model scale values above maximum (greater than 10)
- **Description**: Scale values that are too large
- **Invalid Examples**: 
  - Scale: `11.0`
  - Scale: `20.0`
  - Scale: `100.0`
- **Expected Result**: System clamps scale to maximum (10) or rejects input
- **Test Cases**: AR Model Controls, AR Model Scaling

---

## EP25: Font Size Selection

### EP21.1: Valid Font Size
- **Partition**: Valid font size options
- **Description**: Font sizes that are available in the app
- **Valid Examples**: 
  - `small`
  - `medium`
  - `large`
- **Expected Result**: Font size is accepted and applied successfully
- **Test Cases**: Adjust Font Size

---

## EP26: Theme Selection

### EP22.1: Valid Theme
- **Partition**: Valid theme options
- **Description**: Themes that are available in the app
- **Valid Examples**: 
  - `light`
  - `dark`
- **Expected Result**: Theme is accepted and applied successfully
- **Test Cases**: Change Theme

---

## EP27: Avatar Selection

### EP23.1: Valid Avatar ID
- **Partition**: Valid avatar identifiers
- **Description**: Avatar IDs that exist in the system
- **Valid Examples**: 
  - `m1`, `m2`, `m3` (male avatars)
  - `w1`, `w2`, `w3` (female avatars)
  - `Admin`, `User` (default avatars)
- **Expected Result**: Avatar is accepted and saved successfully
- **Test Cases**: Select Avatar, Avatar Onboarding

### EP23.2: Invalid Avatar ID (Non-Existent)
- **Partition**: Avatar IDs that do not exist
- **Description**: Avatar identifiers that are not in the system
- **Invalid Examples**: 
  - `invalid_avatar`
  - `xyz123`
  - `999`
- **Expected Result**: System rejects input or defaults to a valid avatar
- **Test Cases**: Select Avatar

---

## Summary

This document covers all major input fields and their equivalence partitions in the Shop360 mobile app. Each partition represents a group of input values that should be handled the same way by the application. Testing one value from each partition is sufficient to test the behavior of that entire partition, making equivalence partitioning an efficient testing technique.

### Key Input Categories Covered:
1. **Authentication**: Email, Password, Name
2. **Product Management**: Price, Stock, Quantity, Title, Category
3. **Payment Card Validation**: Card Number, CVV, Expiry Date, Cardholder Name
4. **AR Functionality**: Camera Permission, Tracking State, Model Loading, Plane Detection, Model Scale
5. **Address**: Name, Street, City, State, Zip Code, Country
6. **Search & Filter**: Search Terms, Category Selection
7. **Order Management**: Order Status
8. **User Management**: User Role, Ticket Status
9. **Settings**: Theme, Font Size, Avatar Selection
10. **Support**: Ticket Message

Each partition includes:
- **Partition Description**: What the partition represents
- **Valid/Invalid Examples**: Sample values from the partition
- **Expected Result**: How the system should handle values from this partition
- **Test Cases**: Which test scenarios use this partition