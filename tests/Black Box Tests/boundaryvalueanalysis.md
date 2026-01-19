# Shop360 Mobile App - Boundary Value Analysis Test Cases

## Overview

Boundary Value Analysis (BVA) is a black-box testing technique that focuses on testing values at the boundaries of equivalence partitions. A boundary value is an input or output value on the border of an equivalence partition, including minimum and maximum values at inside and outside boundaries. This document describes all boundary value test cases for the Shop360 mobile app.

**Boundary Value Testing Strategy:**
- **Minimum Boundary (Inside)**: The minimum valid value
- **Minimum Boundary - 1 (Outside)**: Just below the minimum (invalid)
- **Maximum Boundary (Inside)**: The maximum valid value
- **Maximum Boundary + 1 (Outside)**: Just above the maximum (invalid)
- **Typical Value**: A value in the middle of the valid range

---

## BVA1: Password Length Boundaries

### BVA1.1: Password Minimum Boundary (Inside)
- **Boundary**: Minimum valid password length = 6 characters
- **Test Value**: `Pass12` (exactly 6 characters)
- **Description**: Testing password with exactly the minimum required length
- **Expected Result**: Password is accepted and processed successfully
- **Test Cases**: Sign Up, Change Password
- **Priority**: High

### BVA1.2: Password Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 5 characters
- **Test Value**: `Test1` (5 characters)
- **Description**: Testing password with one character less than minimum
- **Expected Result**: System rejects input with error message "Password must be at least 6 characters"
- **Test Cases**: Sign Up, Change Password
- **Priority**: High

### BVA1.3: Password Minimum Boundary + 1 (Inside)
- **Boundary**: Just above minimum = 7 characters
- **Test Value**: `Test123` (7 characters)
- **Description**: Testing password with one character more than minimum
- **Expected Result**: Password is accepted and processed successfully
- **Test Cases**: Sign Up, Change Password
- **Priority**: Medium

### BVA1.4: Password Empty (Absolute Minimum - Outside)
- **Boundary**: Empty string = 0 characters
- **Test Value**: `""` (empty string)
- **Description**: Testing password with no characters
- **Expected Result**: System rejects input with error message "Password is required"
- **Test Cases**: Sign Up, Sign In, Change Password
- **Priority**: High

---

## BVA2: Product Quantity Boundaries

### BVA2.1: Quantity Minimum Boundary (Inside)
- **Boundary**: Minimum valid quantity = 1
- **Test Value**: Quantity = `1`
- **Description**: Testing quantity with exactly the minimum value
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: High

### BVA2.2: Quantity Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0
- **Test Value**: Quantity = `0`
- **Description**: Testing quantity with zero (below minimum)
- **Expected Result**: System prevents setting quantity to zero, minimum quantity is 1
- **Test Cases**: Update Cart Quantity
- **Priority**: High

### BVA2.3: Quantity Maximum Boundary (Inside) - Stock = 10
- **Boundary**: Maximum valid quantity = available stock
- **Test Value**: Stock = `10`, Quantity = `10` (exactly equal to stock)
- **Description**: Testing quantity with exactly the maximum available stock
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: High

### BVA2.4: Quantity Maximum Boundary + 1 (Outside) - Stock = 10
- **Boundary**: Just above maximum = stock + 1
- **Test Value**: Stock = `10`, Quantity = `11`
- **Description**: Testing quantity with one more than available stock
- **Expected Result**: System rejects input with error message "Only 10 item(s) available in stock"
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: High

### BVA2.5: Quantity Maximum Boundary - 1 (Inside) - Stock = 10
- **Boundary**: Just below maximum = stock - 1
- **Test Value**: Stock = `10`, Quantity = `9`
- **Description**: Testing quantity with one less than maximum stock
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: Medium

### BVA2.6: Quantity Typical Value (Inside)
- **Boundary**: Middle of valid range
- **Test Value**: Stock = `10`, Quantity = `5`
- **Description**: Testing quantity with a typical middle value
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: Low

### BVA2.7: Quantity with Stock = 1 (Edge Case)
- **Boundary**: Maximum = 1 (minimum stock scenario)
- **Test Value**: Stock = `1`, Quantity = `1`
- **Description**: Testing quantity when stock is exactly 1
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: High

### BVA2.8: Quantity with Stock = 1, Attempt to Add 2 (Outside)
- **Boundary**: Stock = 1, Quantity = 2 (exceeds stock)
- **Test Value**: Stock = `1`, Quantity = `2`
- **Description**: Testing quantity exceeding stock when stock is minimum
- **Expected Result**: System rejects input with error message "Only 1 item(s) available in stock"
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: High

---

## BVA3: Product Price Boundaries

### BVA3.1: Price Minimum Boundary (Inside)
- **Boundary**: Minimum valid price = 0.01
- **Test Value**: Price = `0.01`
- **Description**: Testing price with exactly the minimum value
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: High

### BVA3.2: Price Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0.00
- **Test Value**: Price = `0.00` or `0`
- **Description**: Testing price with zero (below minimum)
- **Expected Result**: System rejects input with error message "Price must be greater than zero"
- **Test Cases**: Create Product, Edit Product
- **Priority**: High

### BVA3.3: Price Minimum Boundary - 0.01 (Outside)
- **Boundary**: Just below minimum = -0.01
- **Test Value**: Price = `-0.01`
- **Description**: Testing price with negative value just below zero
- **Expected Result**: System rejects input with error message "Price cannot be negative"
- **Test Cases**: Create Product, Edit Product
- **Priority**: High

### BVA3.4: Price Minimum Boundary + 0.01 (Inside)
- **Boundary**: Just above minimum = 0.02
- **Test Value**: Price = `0.02`
- **Description**: Testing price with one cent more than minimum
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Medium

### BVA3.5: Price Typical Value (Inside)
- **Boundary**: Middle of valid range
- **Test Value**: Price = `99.99`
- **Description**: Testing price with a typical value
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Low

### BVA3.6: Price Large Value (Inside)
- **Boundary**: Large price value
- **Test Value**: Price = `9999.99`
- **Description**: Testing price with a large but valid value
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Medium

---

## BVA4: Product Stock Boundaries

### BVA4.1: Stock Minimum Boundary (Inside)
- **Boundary**: Minimum valid stock = 0
- **Test Value**: Stock = `0`
- **Description**: Testing stock with exactly zero (valid state for out of stock)
- **Expected Result**: Stock is accepted and product is saved successfully (product marked as out of stock)
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: High

### BVA4.2: Stock Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = -1
- **Test Value**: Stock = `-1`
- **Description**: Testing stock with negative value
- **Expected Result**: System rejects input with error message "Stock cannot be negative"
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: High

### BVA4.3: Stock Minimum Boundary + 1 (Inside)
- **Boundary**: Just above minimum = 1
- **Test Value**: Stock = `1`
- **Description**: Testing stock with one (minimum in stock)
- **Expected Result**: Stock is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: High

### BVA4.4: Stock Typical Value (Inside)
- **Boundary**: Middle of valid range
- **Test Value**: Stock = `100`
- **Description**: Testing stock with a typical value
- **Expected Result**: Stock is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: Low

### BVA4.5: Stock Large Value (Inside)
- **Boundary**: Large stock value
- **Test Value**: Stock = `10000`
- **Description**: Testing stock with a large but valid value
- **Expected Result**: Stock is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: Medium

---

## BVA5: Payment Card Number Length Boundaries

### BVA5.1: Card Number Minimum Boundary - Visa/Mastercard/Discover (Inside)
- **Boundary**: Minimum valid length = 16 digits
- **Test Value**: `4111111111111111` (exactly 16 digits - Visa test)
- **Description**: Testing card number with exactly 16 digits
- **Expected Result**: Card number is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA5.2: Card Number Minimum Boundary - 1 (Outside) - 16-digit cards
- **Boundary**: Just below minimum = 15 digits (for 16-digit cards)
- **Test Value**: `411111111111111` (15 digits - too short for Visa/MC/Discover)
- **Description**: Testing card number with one digit less than required
- **Expected Result**: System rejects input with error message "Invalid card number"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA5.3: Card Number Maximum Boundary (Inside) - Visa/Mastercard/Discover
- **Boundary**: Maximum valid length = 16 digits
- **Test Value**: `5555555555554444` (exactly 16 digits - Mastercard test)
- **Description**: Testing card number with exactly 16 digits (maximum for Visa/MC/Discover)
- **Expected Result**: Card number is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA5.4: Card Number Maximum Boundary + 1 (Outside) - 16-digit cards
- **Boundary**: Just above maximum = 17 digits (for 16-digit cards)
- **Test Value**: `41111111111111112` (17 digits - too long for Visa/MC/Discover)
- **Description**: Testing card number with one digit more than maximum
- **Expected Result**: System rejects input with error message "Invalid card number"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA5.5: Card Number Minimum Boundary - Amex (Inside)
- **Boundary**: Minimum valid length = 15 digits (Amex)
- **Test Value**: `378282246310005` (exactly 15 digits - Amex test)
- **Description**: Testing Amex card number with exactly 15 digits
- **Expected Result**: Card number is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA5.6: Card Number Minimum Boundary - 1 (Outside) - Amex
- **Boundary**: Just below minimum = 14 digits (for Amex)
- **Test Value**: `37828224631000` (14 digits - too short for Amex)
- **Description**: Testing Amex card number with one digit less than required
- **Expected Result**: System rejects input with error message "Invalid card number"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA5.7: Card Number Maximum Boundary + 1 (Outside) - Amex
- **Boundary**: Just above maximum = 16 digits (for Amex)
- **Test Value**: `3782822463100051` (16 digits - too long for Amex)
- **Description**: Testing Amex card number with one digit more than maximum
- **Expected Result**: System rejects input with error message "Invalid card number"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

---

## BVA6: CVV Length Boundaries

### BVA6.1: CVV Minimum Boundary - 3-digit cards (Inside)
- **Boundary**: Minimum valid length = 3 digits (Visa/Mastercard/Discover)
- **Test Value**: `123` (exactly 3 digits)
- **Description**: Testing CVV with exactly 3 digits
- **Expected Result**: CVV is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA6.2: CVV Minimum Boundary - 1 (Outside) - 3-digit cards
- **Boundary**: Just below minimum = 2 digits (for 3-digit requirement)
- **Test Value**: `12` (2 digits - too short)
- **Description**: Testing CVV with one digit less than required
- **Expected Result**: System rejects input with error message "CVV is required (3 digits)"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA6.3: CVV Maximum Boundary (Inside) - 3-digit cards
- **Boundary**: Maximum valid length = 3 digits (Visa/Mastercard/Discover)
- **Test Value**: `999` (exactly 3 digits)
- **Description**: Testing CVV with exactly 3 digits (maximum for non-Amex)
- **Expected Result**: CVV is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA6.4: CVV Maximum Boundary + 1 (Outside) - 3-digit cards
- **Boundary**: Just above maximum = 4 digits (for 3-digit requirement)
- **Test Value**: `1234` (4 digits - too long for non-Amex)
- **Description**: Testing CVV with one digit more than maximum for non-Amex cards
- **Expected Result**: System rejects input with error message "CVV must be 3 digits"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA6.5: CVV Minimum Boundary - Amex (Inside)
- **Boundary**: Minimum valid length = 4 digits (Amex)
- **Test Value**: `1234` (exactly 4 digits)
- **Description**: Testing Amex CVV with exactly 4 digits
- **Expected Result**: CVV is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA6.6: CVV Minimum Boundary - 1 (Outside) - Amex
- **Boundary**: Just below minimum = 3 digits (for Amex 4-digit requirement)
- **Test Value**: `123` (3 digits - too short for Amex)
- **Description**: Testing Amex CVV with one digit less than required
- **Expected Result**: System rejects input with error message "CVV is required (4 digits)"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA6.7: CVV Maximum Boundary + 1 (Outside) - Amex
- **Boundary**: Just above maximum = 5 digits (for Amex)
- **Test Value**: `12345` (5 digits - too long for Amex)
- **Description**: Testing Amex CVV with one digit more than maximum
- **Expected Result**: System rejects input with error message "CVV must be 4 digits"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

---

## BVA7: Expiry Month Boundaries

### BVA7.1: Expiry Month Minimum Boundary (Inside)
- **Boundary**: Minimum valid month = 1
- **Test Value**: Month = `1` or `01` (January)
- **Description**: Testing expiry month with exactly the minimum value
- **Expected Result**: Expiry month is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA7.2: Expiry Month Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0
- **Test Value**: Month = `0` or `00`
- **Description**: Testing expiry month with zero (below minimum)
- **Expected Result**: System rejects input with error message "Invalid expiry month (must be 1-12)"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA7.3: Expiry Month Maximum Boundary (Inside)
- **Boundary**: Maximum valid month = 12
- **Test Value**: Month = `12` (December)
- **Description**: Testing expiry month with exactly the maximum value
- **Expected Result**: Expiry month is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA7.4: Expiry Month Maximum Boundary + 1 (Outside)
- **Boundary**: Just above maximum = 13
- **Test Value**: Month = `13`
- **Description**: Testing expiry month with one more than maximum
- **Expected Result**: System rejects input with error message "Invalid expiry month (must be 1-12)"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA7.5: Expiry Month Maximum Boundary - 1 (Inside)
- **Boundary**: Just below maximum = 11
- **Test Value**: Month = `11` (November)
- **Description**: Testing expiry month with one less than maximum
- **Expected Result**: Expiry month is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: Medium

### BVA7.6: Expiry Month Typical Value (Inside)
- **Boundary**: Middle of valid range
- **Test Value**: Month = `6` or `06` (June)
- **Description**: Testing expiry month with a typical middle value
- **Expected Result**: Expiry month is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: Low

---

## BVA8: Expiry Year Boundaries

### BVA8.1: Expiry Year Minimum Boundary (Inside) - Current Year
- **Boundary**: Minimum valid year = current year
- **Test Value**: Year = `24` (if current year is 2024)
- **Description**: Testing expiry year with exactly the current year
- **Expected Result**: Expiry year is accepted and validated successfully (if month is current or future)
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA8.2: Expiry Year Minimum Boundary - 1 (Outside) - Past Year
- **Boundary**: Just below minimum = current year - 1
- **Test Value**: Year = `23` (if current year is 2024)
- **Description**: Testing expiry year with one year in the past
- **Expected Result**: System rejects input with error message "Card has expired"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA8.3: Expiry Year Minimum Boundary + 1 (Inside) - Future Year
- **Boundary**: Just above minimum = current year + 1
- **Test Value**: Year = `25` (if current year is 2024)
- **Description**: Testing expiry year with one year in the future
- **Expected Result**: Expiry year is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA8.4: Expiry Year Typical Value (Inside) - Far Future
- **Boundary**: Typical future year
- **Test Value**: Year = `30` (6 years in future)
- **Description**: Testing expiry year with a typical future value
- **Expected Result**: Expiry year is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: Low

### BVA8.5: Expiry Year Current Year with Past Month (Outside)
- **Boundary**: Current year but expired month
- **Test Value**: Current date: March 2024, Expiry: `02/24` (February 2024)
- **Description**: Testing expiry with current year but past month
- **Expected Result**: System rejects input with error message "Card has expired"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA8.6: Expiry Year Current Year with Current Month (Inside)
- **Boundary**: Current year and current month
- **Test Value**: Current date: March 2024, Expiry: `03/24` (March 2024)
- **Description**: Testing expiry with current year and current month
- **Expected Result**: Expiry is accepted and validated successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

---

## BVA9: Cardholder Name Length Boundaries

### BVA9.1: Cardholder Name Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 2 characters
- **Test Value**: `AB` (exactly 2 characters)
- **Description**: Testing cardholder name with exactly the minimum length
- **Expected Result**: Cardholder name is accepted and saved successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA9.2: Cardholder Name Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 1 character
- **Test Value**: `A` (1 character)
- **Description**: Testing cardholder name with one character less than minimum
- **Expected Result**: System rejects input with error message "Cardholder name must be at least 2 characters"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA9.3: Cardholder Name Minimum Boundary + 1 (Inside)
- **Boundary**: Just above minimum = 3 characters
- **Test Value**: `ABC` (3 characters)
- **Description**: Testing cardholder name with one character more than minimum
- **Expected Result**: Cardholder name is accepted and saved successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: Medium

### BVA9.4: Cardholder Name Empty (Absolute Minimum - Outside)
- **Boundary**: Empty string = 0 characters
- **Test Value**: `""` (empty string)
- **Description**: Testing cardholder name with no characters
- **Expected Result**: System rejects input with error message "Cardholder name is required"
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: High

### BVA9.5: Cardholder Name Typical Value (Inside)
- **Boundary**: Typical name length
- **Test Value**: `John Doe` (8 characters)
- **Description**: Testing cardholder name with a typical value
- **Expected Result**: Cardholder name is accepted and saved successfully
- **Test Cases**: Add Payment Card, Edit Payment Card
- **Priority**: Low

---

## BVA10: AR Model Scale Boundaries

### BVA10.1: Model Scale Minimum Boundary (Inside)
- **Boundary**: Minimum valid scale = 0.1
- **Test Value**: Scale = `0.1` (exactly minimum)
- **Description**: Testing model scale with exactly the minimum value
- **Expected Result**: Model scale is applied successfully, model appears at smallest size
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: High

### BVA10.2: Model Scale Minimum Boundary - 0.01 (Outside)
- **Boundary**: Just below minimum = 0.09
- **Test Value**: Scale = `0.09`
- **Description**: Testing model scale with value just below minimum
- **Expected Result**: System clamps scale to minimum (0.1) or rejects input
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: High

### BVA10.3: Model Scale Minimum Boundary + 0.1 (Inside)
- **Boundary**: Just above minimum = 0.2
- **Test Value**: Scale = `0.2`
- **Description**: Testing model scale with value just above minimum
- **Expected Result**: Model scale is applied successfully
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: Medium

### BVA10.4: Model Scale Maximum Boundary (Inside)
- **Boundary**: Maximum valid scale = 10.0
- **Test Value**: Scale = `10.0` (exactly maximum)
- **Description**: Testing model scale with exactly the maximum value
- **Expected Result**: Model scale is applied successfully, model appears at largest size
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: High

### BVA10.5: Model Scale Maximum Boundary + 0.1 (Outside)
- **Boundary**: Just above maximum = 10.1
- **Test Value**: Scale = `10.1`
- **Description**: Testing model scale with value just above maximum
- **Expected Result**: System clamps scale to maximum (10.0) or rejects input
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: High

### BVA10.6: Model Scale Maximum Boundary - 0.1 (Inside)
- **Boundary**: Just below maximum = 9.9
- **Test Value**: Scale = `9.9`
- **Description**: Testing model scale with value just below maximum
- **Expected Result**: Model scale is applied successfully
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: Medium

### BVA10.7: Model Scale Typical Value (Inside)
- **Boundary**: Middle of valid range
- **Test Value**: Scale = `1.0` (default/normal)
- **Description**: Testing model scale with typical default value
- **Expected Result**: Model scale is applied successfully, model appears at normal size
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: Low

### BVA10.8: Model Scale Zero (Outside)
- **Boundary**: Zero scale = 0.0
- **Test Value**: Scale = `0.0`
- **Description**: Testing model scale with zero (invalid)
- **Expected Result**: System clamps scale to minimum (0.1) or rejects input
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: High

### BVA10.9: Model Scale Negative (Outside)
- **Boundary**: Negative scale = -0.1
- **Test Value**: Scale = `-0.1`
- **Description**: Testing model scale with negative value (invalid)
- **Expected Result**: System clamps scale to minimum (0.1) or rejects input
- **Test Cases**: AR Model Controls, AR Model Scaling
- **Priority**: High

---

## BVA11: AR Model Rotation Boundaries

### BVA11.1: Model Rotation Minimum Boundary (Inside)
- **Boundary**: Minimum valid rotation = 0 degrees
- **Test Value**: Rotation = `0` degrees
- **Description**: Testing model rotation with exactly zero (no rotation)
- **Expected Result**: Model rotation is applied successfully, model appears at default orientation
- **Test Cases**: AR Model Controls, AR Model Rotation
- **Priority**: High

### BVA11.2: Model Rotation Maximum Boundary (Inside)
- **Boundary**: Maximum valid rotation = 360 degrees
- **Test Value**: Rotation = `360` degrees
- **Description**: Testing model rotation with exactly 360 degrees (full rotation)
- **Expected Result**: Model rotation is applied successfully, model appears at same orientation as 0 degrees
- **Test Cases**: AR Model Controls, AR Model Rotation
- **Priority**: High

### BVA11.3: Model Rotation Maximum Boundary + 1 (Outside)
- **Boundary**: Just above maximum = 361 degrees
- **Test Value**: Rotation = `361` degrees
- **Description**: Testing model rotation with value just above maximum
- **Expected Result**: System normalizes rotation to 0-360 range (361 = 1 degree) or clamps to 360
- **Test Cases**: AR Model Controls, AR Model Rotation
- **Priority**: Medium

### BVA11.4: Model Rotation Typical Value (Inside)
- **Boundary**: Middle of valid range
- **Test Value**: Rotation = `180` degrees
- **Description**: Testing model rotation with typical middle value
- **Expected Result**: Model rotation is applied successfully, model appears rotated 180 degrees
- **Test Cases**: AR Model Controls, AR Model Rotation
- **Priority**: Low

### BVA11.5: Model Rotation Negative (Inside - Normalized)
- **Boundary**: Negative rotation = -90 degrees
- **Test Value**: Rotation = `-90` degrees
- **Description**: Testing model rotation with negative value (should normalize to 270 degrees)
- **Expected Result**: System normalizes rotation to positive equivalent (270 degrees) or handles as valid
- **Test Cases**: AR Model Controls, AR Model Rotation
- **Priority**: Medium

---

## BVA12: AR Model Loading Progress Boundaries

### BVA12.1: Model Loading Progress Minimum Boundary (Inside)
- **Boundary**: Minimum valid progress = 0%
- **Test Value**: Progress = `0%`
- **Description**: Testing model loading progress at start (0%)
- **Expected Result**: Loading indicator shows 0%, download begins
- **Test Cases**: AR Model Loading
- **Priority**: High

### BVA12.2: Model Loading Progress Maximum Boundary (Inside)
- **Boundary**: Maximum valid progress = 100%
- **Test Value**: Progress = `100%`
- **Description**: Testing model loading progress at completion (100%)
- **Expected Result**: Loading indicator shows 100%, model is ready for placement
- **Test Cases**: AR Model Loading
- **Priority**: High

### BVA12.3: Model Loading Progress Maximum Boundary + 1 (Outside)
- **Boundary**: Just above maximum = 101%
- **Test Value**: Progress = `101%`
- **Description**: Testing model loading progress above 100% (should not occur)
- **Expected Result**: System clamps progress to 100% or handles gracefully
- **Test Cases**: AR Model Loading
- **Priority**: Medium

### BVA12.4: Model Loading Progress Typical Value (Inside)
- **Boundary**: Middle of valid range
- **Test Value**: Progress = `50%`
- **Description**: Testing model loading progress at midpoint
- **Expected Result**: Loading indicator shows 50%, download continues
- **Test Cases**: AR Model Loading
- **Priority**: Low

### BVA12.5: Model Loading Progress Negative (Outside)
- **Boundary**: Negative progress = -1%
- **Test Value**: Progress = `-1%`
- **Description**: Testing model loading progress with negative value (invalid)
- **Expected Result**: System clamps progress to 0% or handles as error
- **Test Cases**: AR Model Loading
- **Priority**: High

---

## BVA13: AR Model Position Boundaries

### BVA13.1: Model Position Minimum Boundary (Inside)
- **Boundary**: Minimum valid position coordinates
- **Test Value**: Position = `[0, 0, 0]` (origin)
- **Description**: Testing model position at world origin
- **Expected Result**: Model position is set successfully, model appears at origin
- **Test Cases**: AR Model Placement, AR Model Position
- **Priority**: High

### BVA13.2: Model Position Negative Coordinates (Inside)
- **Boundary**: Negative position coordinates
- **Test Value**: Position = `[-1.0, -0.5, -2.0]`
- **Description**: Testing model position with negative coordinates (valid in 3D space)
- **Expected Result**: Model position is set successfully, model appears at negative coordinates
- **Test Cases**: AR Model Placement, AR Model Position
- **Priority**: Medium

### BVA13.3: Model Position Large Positive Coordinates (Inside)
- **Boundary**: Large positive position coordinates
- **Test Value**: Position = `[10.0, 5.0, 10.0]`
- **Description**: Testing model position with large positive coordinates
- **Expected Result**: Model position is set successfully, model appears far from origin
- **Test Cases**: AR Model Placement, AR Model Position
- **Priority**: Medium

### BVA13.4: Model Position Typical Value (Inside)
- **Boundary**: Typical position coordinates
- **Test Value**: Position = `[0, 0, -1.0]` (1 meter in front of camera)
- **Description**: Testing model position with typical placement distance
- **Expected Result**: Model position is set successfully, model appears at typical distance
- **Test Cases**: AR Model Placement, AR Model Position
- **Priority**: Low

---

## BVA14: AR Tracking Quality Boundaries

### BVA14.1: AR Tracking Quality Ready (Inside)
- **Boundary**: Tracking quality = ready/optimal
- **Test Value**: Tracking state = `ready`, Reason = `none`
- **Description**: Testing AR tracking at optimal quality
- **Expected Result**: AR tracking works perfectly, plane detection is accurate, model placement enabled
- **Test Cases**: AR Tracking, AR Model Placement
- **Priority**: High

### BVA14.2: AR Tracking Quality Limited - Insufficient Features (Inside)
- **Boundary**: Tracking quality = limited due to insufficient features
- **Test Value**: Tracking state = `limited`, Reason = `insufficient-features`
- **Description**: Testing AR tracking with limited quality due to featureless environment
- **Expected Result**: Warning message displayed, plane detection less accurate, model placement may be disabled
- **Test Cases**: AR Tracking, AR Model Placement
- **Priority**: High

### BVA14.3: AR Tracking Quality Limited - Excessive Motion (Inside)
- **Boundary**: Tracking quality = limited due to excessive motion
- **Test Value**: Tracking state = `limited`, Reason = `excessive-motion`
- **Description**: Testing AR tracking with limited quality due to device movement
- **Expected Result**: Warning message displayed, user prompted to slow down, tracking may be unstable
- **Test Cases**: AR Tracking, AR Model Placement
- **Priority**: High

### BVA14.4: AR Tracking Quality Limited - Insufficient Light (Inside)
- **Boundary**: Tracking quality = limited due to insufficient light
- **Test Value**: Tracking state = `limited`, Reason = `insufficient-light`
- **Description**: Testing AR tracking with limited quality due to poor lighting
- **Expected Result**: Warning message displayed, user prompted to improve lighting, tracking may be less accurate
- **Test Cases**: AR Tracking, AR Model Placement
- **Priority**: High

### BVA14.5: AR Tracking Quality Unavailable (Outside)
- **Boundary**: Tracking quality = unavailable
- **Test Value**: Tracking state = `unavailable`, Reason = `error` or `not-available`
- **Description**: Testing AR tracking when it's completely unavailable
- **Expected Result**: Error message displayed, AR view cannot function, user is notified
- **Test Cases**: AR Tracking, AR Model Placement
- **Priority**: High

---

## BVA15: User Name Length Boundaries

### BVA15.1: User Name Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 1 character
- **Test Value**: `A` (exactly 1 character)
- **Description**: Testing user name with exactly the minimum length
- **Expected Result**: Name is accepted and saved successfully
- **Test Cases**: Sign Up, Update Name
- **Priority**: High

### BVA15.2: User Name Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0 characters (empty)
- **Test Value**: `""` (empty string)
- **Description**: Testing user name with no characters
- **Expected Result**: System rejects input with error message "Name is required"
- **Test Cases**: Sign Up, Update Name
- **Priority**: High

### BVA15.3: User Name Minimum Boundary + 1 (Inside)
- **Boundary**: Just above minimum = 2 characters
- **Test Value**: `AB` (2 characters)
- **Description**: Testing user name with one character more than minimum
- **Expected Result**: Name is accepted and saved successfully
- **Test Cases**: Sign Up, Update Name
- **Priority**: Medium

### BVA15.4: User Name Typical Value (Inside)
- **Boundary**: Typical name length
- **Test Value**: `John Doe` (8 characters)
- **Description**: Testing user name with a typical value
- **Expected Result**: Name is accepted and saved successfully
- **Test Cases**: Sign Up, Update Name
- **Priority**: Low

---

## BVA16: Product Title Length Boundaries

### BVA16.1: Product Title Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 1 character
- **Test Value**: `A` (exactly 1 character)
- **Description**: Testing product title with exactly the minimum length
- **Expected Result**: Product title is accepted and saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: High

### BVA16.2: Product Title Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0 characters (empty)
- **Test Value**: `""` (empty string)
- **Description**: Testing product title with no characters
- **Expected Result**: System rejects input with error message "Product title is required"
- **Test Cases**: Create Product, Edit Product
- **Priority**: High

### BVA16.3: Product Title Minimum Boundary + 1 (Inside)
- **Boundary**: Just above minimum = 2 characters
- **Test Value**: `AB` (2 characters)
- **Description**: Testing product title with one character more than minimum
- **Expected Result**: Product title is accepted and saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Medium

### BVA16.4: Product Title Typical Value (Inside)
- **Boundary**: Typical title length
- **Test Value**: `Samsung Galaxy S21 Ultra` (23 characters)
- **Description**: Testing product title with a typical value
- **Expected Result**: Product title is accepted and saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Low

---

## BVA17: Category Name Length Boundaries

### BVA17.1: Category Name Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 1 character
- **Test Value**: `A` (exactly 1 character)
- **Description**: Testing category name with exactly the minimum length
- **Expected Result**: Category name is accepted and category is created successfully
- **Test Cases**: Create Category, Edit Category
- **Priority**: High

### BVA17.2: Category Name Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0 characters (empty)
- **Test Value**: `""` (empty string)
- **Description**: Testing category name with no characters
- **Expected Result**: System rejects input with error message "Category name is required"
- **Test Cases**: Create Category, Edit Category
- **Priority**: High

### BVA17.3: Category Name Minimum Boundary + 1 (Inside)
- **Boundary**: Just above minimum = 2 characters
- **Test Value**: `AB` (2 characters)
- **Description**: Testing category name with one character more than minimum
- **Expected Result**: Category name is accepted and category is created successfully
- **Test Cases**: Create Category, Edit Category
- **Priority**: Medium

### BVA17.4: Category Name Typical Value (Inside)
- **Boundary**: Typical category name length
- **Test Value**: `Electronics` (11 characters)
- **Description**: Testing category name with a typical value
- **Expected Result**: Category name is accepted and category is created successfully
- **Test Cases**: Create Category, Edit Category
- **Priority**: Low

---

## BVA18: Support Ticket Message Length Boundaries

### BVA18.1: Ticket Message Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 1 character
- **Test Value**: `A` (exactly 1 character)
- **Description**: Testing ticket message with exactly the minimum length
- **Expected Result**: Ticket message is accepted and ticket is created successfully
- **Test Cases**: Submit Support Ticket
- **Priority**: High

### BVA18.2: Ticket Message Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0 characters (empty)
- **Test Value**: `""` (empty string)
- **Description**: Testing ticket message with no characters
- **Expected Result**: System rejects input with error message "Message is required"
- **Test Cases**: Submit Support Ticket
- **Priority**: High

### BVA18.3: Ticket Message Minimum Boundary + 1 (Inside)
- **Boundary**: Just above minimum = 2 characters
- **Test Value**: `AB` (2 characters)
- **Description**: Testing ticket message with one character more than minimum
- **Expected Result**: Ticket message is accepted and ticket is created successfully
- **Test Cases**: Submit Support Ticket
- **Priority**: Medium

### BVA18.4: Ticket Message Typical Value (Inside)
- **Boundary**: Typical message length
- **Test Value**: `I need help with my order` (25 characters)
- **Description**: Testing ticket message with a typical value
- **Expected Result**: Ticket message is accepted and ticket is created successfully
- **Test Cases**: Submit Support Ticket
- **Priority**: Low

---

## BVA19: Address Field Length Boundaries

### BVA19.1: Address Name Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 1 character
- **Test Value**: `A` (exactly 1 character)
- **Description**: Testing address name with exactly the minimum length
- **Expected Result**: Address name is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address
- **Priority**: High

### BVA19.2: Address Name Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0 characters (empty)
- **Test Value**: `""` (empty string)
- **Description**: Testing address name with no characters
- **Expected Result**: System rejects input with error message "Name is required"
- **Test Cases**: Add Address, Edit Address
- **Priority**: High

### BVA19.3: Street Address Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 1 character
- **Test Value**: `A` (exactly 1 character)
- **Description**: Testing street address with exactly the minimum length
- **Expected Result**: Street address is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address
- **Priority**: High

### BVA19.4: Street Address Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0 characters (empty)
- **Test Value**: `""` (empty string)
- **Description**: Testing street address with no characters
- **Expected Result**: System rejects input with error message "Street address is required"
- **Test Cases**: Add Address, Edit Address
- **Priority**: High

### BVA19.5: City Minimum Boundary (Inside)
- **Boundary**: Minimum valid length = 1 character
- **Test Value**: `A` (exactly 1 character)
- **Description**: Testing city with exactly the minimum length
- **Expected Result**: City is accepted and saved successfully
- **Test Cases**: Add Address, Edit Address
- **Priority**: High

### BVA19.6: City Minimum Boundary - 1 (Outside)
- **Boundary**: Just below minimum = 0 characters (empty)
- **Test Value**: `""` (empty string)
- **Description**: Testing city with no characters
- **Expected Result**: System rejects input with error message "City is required"
- **Test Cases**: Add Address, Edit Address
- **Priority**: High

---

## BVA20: Quantity vs Stock Relationship Boundaries

### BVA20.1: Quantity Equal to Stock (Inside)
- **Boundary**: Quantity exactly equals stock
- **Test Value**: Stock = `5`, Quantity = `5`
- **Description**: Testing quantity when it exactly matches available stock
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: High

### BVA20.2: Quantity One Less Than Stock (Inside)
- **Boundary**: Quantity = stock - 1
- **Test Value**: Stock = `5`, Quantity = `4`
- **Description**: Testing quantity when it is one less than stock
- **Expected Result**: Quantity is accepted and cart item is updated successfully
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: Medium

### BVA20.3: Quantity One More Than Stock (Outside)
- **Boundary**: Quantity = stock + 1
- **Test Value**: Stock = `5`, Quantity = `6`
- **Description**: Testing quantity when it exceeds stock by one
- **Expected Result**: System rejects input with error message "Only 5 item(s) available in stock"
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: High

### BVA20.4: Quantity Much Greater Than Stock (Outside)
- **Boundary**: Quantity >> stock
- **Test Value**: Stock = `5`, Quantity = `100`
- **Description**: Testing quantity when it greatly exceeds stock
- **Expected Result**: System rejects input with error message "Only 5 item(s) available in stock"
- **Test Cases**: Add to Cart, Update Cart Quantity
- **Priority**: Medium

---

## BVA21: Price Decimal Precision Boundaries

### BVA21.1: Price with Maximum Decimal Places (Inside)
- **Boundary**: Price with 2 decimal places (standard)
- **Test Value**: Price = `99.99`
- **Description**: Testing price with exactly 2 decimal places
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Medium

### BVA21.2: Price with Integer Value (Inside)
- **Boundary**: Price with 0 decimal places
- **Test Value**: Price = `100` (integer)
- **Description**: Testing price with no decimal places
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Medium

### BVA21.3: Price with One Decimal Place (Inside)
- **Boundary**: Price with 1 decimal place
- **Test Value**: Price = `99.9`
- **Description**: Testing price with one decimal place
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: Medium

### BVA21.4: Price with Minimum Decimal Value (Inside)
- **Boundary**: Price with smallest decimal increment
- **Test Value**: Price = `0.01`
- **Description**: Testing price with the smallest valid decimal value
- **Expected Result**: Price is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product
- **Priority**: High

---

## BVA22: Stock Integer Boundaries

### BVA22.1: Stock as Integer Zero (Inside)
- **Boundary**: Stock = 0 (valid integer)
- **Test Value**: Stock = `0`
- **Description**: Testing stock with exactly zero
- **Expected Result**: Stock is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: High

### BVA22.2: Stock as Integer One (Inside)
- **Boundary**: Stock = 1 (minimum positive integer)
- **Test Value**: Stock = `1`
- **Description**: Testing stock with exactly one
- **Expected Result**: Stock is accepted and product is saved successfully
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: High

### BVA22.3: Stock as Negative Integer (Outside)
- **Boundary**: Stock = -1 (invalid integer)
- **Test Value**: Stock = `-1`
- **Description**: Testing stock with negative integer
- **Expected Result**: System rejects input with error message "Stock cannot be negative"
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: High

### BVA22.4: Stock as Decimal (Outside)
- **Boundary**: Stock with decimal value (invalid)
- **Test Value**: Stock = `10.5`
- **Description**: Testing stock with decimal value
- **Expected Result**: System rejects input with error message "Stock must be a whole number"
- **Test Cases**: Create Product, Edit Product, Update Stock
- **Priority**: High

---

## Summary

This document covers all major boundary value test cases for the Shop360 mobile app. Boundary value analysis focuses on testing values at the edges of equivalence partitions, which is where most errors occur.

### Key Boundary Categories Covered:

1. **Length Boundaries**: Password (6 chars), Card Number (15/16 digits), CVV (3/4 digits), Names (1-2 chars)
2. **Numeric Range Boundaries**: Quantity (1 to stock), Price (>0), Stock (≥0), Expiry Month (1-12)
3. **Date Boundaries**: Expiry Year (current or future), Expiry Month with Year combinations
4. **AR Functionality Boundaries**: Model Scale (0.1-10), Model Rotation (0-360°), Loading Progress (0-100%), Position Coordinates
5. **Relationship Boundaries**: Quantity vs Stock relationships
6. **Precision Boundaries**: Price decimal places, Stock integer requirements
7. **AR Tracking Quality Boundaries**: Ready, Limited (various reasons), Unavailable

### Boundary Testing Strategy Applied:

For each boundary, we test:
- **Minimum Boundary (Inside)**: The minimum valid value
- **Minimum Boundary - 1 (Outside)**: Just below minimum (invalid)
- **Maximum Boundary (Inside)**: The maximum valid value
- **Maximum Boundary + 1 (Outside)**: Just above maximum (invalid)
- **Typical Value (Inside)**: A value in the middle of the valid range

### Benefits of Boundary Value Analysis:

1. **Error Detection**: Most errors occur at boundaries, making BVA highly effective
2. **Efficient Testing**: Tests fewer values while maintaining high coverage
3. **Stress Testing**: Boundary values often represent stress conditions
4. **Negative Testing**: Boundary - 1 and + 1 values test negative scenarios
5. **Comprehensive Coverage**: Ensures all edge cases are tested

Each boundary test case includes:
- **Boundary Description**: What boundary is being tested
- **Test Value**: The specific value to test
- **Expected Result**: How the system should handle this boundary value
- **Test Cases**: Which scenarios use this boundary
- **Priority**: Importance level for testing
