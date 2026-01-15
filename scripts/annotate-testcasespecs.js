const fs = require('fs');
const FILE = 'testcasespecs.md';
const lines = fs.readFileSync(FILE,'utf8').split(/\r?\n/);

function verdict(ref){
  if (!ref) return ['Partial','Reference not found in this test case block'];

  // NFR
  if (/^NFR\d+\./.test(ref)) {
    if (ref === 'NFR1.2') return ['Yes','Uses Firestore real-time `onSnapshot` subscriptions across products/cart/orders'];
    if (ref === 'NFR2.1') return ['Yes','Email verification enforced in App navigation + service guards (cart/wishlist/tickets)'];
    if (ref === 'NFR2.2') return ['Yes','Admin access gated via `isAdmin` checks + AdminTabsGate'];
    if (ref === 'NFR3.3') return ['Yes','User-facing error handling via alerts and screen state across flows'];
    return ['Partial','Non-functional requirement is not fully verifiable from code alone (needs measurement/UX testing)'];
  }

  // Exact FR family checks (avoid FR12 matching FR1)
  if (/^FR12\./.test(ref)) return ['Yes','Admin product management via `productAdminService` + `AdminProductsScreen`/`AdminProductEditScreen`'];
  if (/^FR13\./.test(ref)) return ['Yes','Admin order management via `adminService` + `AdminOrdersScreen`/`AdminOrderDetailScreen`'];
  if (/^FR14\./.test(ref)) return ['Yes','Admin user management via `adminService` + `AdminUsersScreen`/`AdminUserDetailScreen`'];
  if (/^FR15\./.test(ref)) return ['Yes','Admin categories via `categoryAdminService` + `AdminCategoriesScreen`'];
  if (/^FR17\./.test(ref)) return ['Yes','Admin inquiries via `ticketService` + `AdminInquiriesScreen`'];

  if (/^FR10\./.test(ref)) return ['Yes','AR via `ARViewScreen` + Viro + `ModelPlacementARScene`'];
  if (/^FR11\./.test(ref)) return ['Yes','Admin dashboard via `adminService` + `AdminDashboardScreen`'];

  if (/^FR19\./.test(ref)) return ['Yes','Notifications via `notificationService` + `NotificationsScreen`'];
  if (/^FR18\./.test(ref)) return ['Yes','Settings via Theme/Font contexts + Settings/Policy/Terms screens'];
  if (/^FR16\./.test(ref)) return ['Yes','Support tickets via `ticketService` + Help/MyTickets screens'];

  if (/^FR9\./.test(ref)) return ['Yes','Payment methods via `paymentMethodService` + payment screens'];
  if (/^FR8\./.test(ref)) return ['Yes','Addresses via `addressService` + address screens'];
  if (/^FR7\./.test(ref)) return ['Yes','Orders via `orderService` + Order screens'];
  if (/^FR6\./.test(ref)) return ['Yes','Checkout via `CheckoutScreen` + `orderService.placeOrderFromCart()`'];
  if (/^FR5\./.test(ref)) return ['Yes','Wishlist via `wishlistService` + Product/Wishlist screens'];

  if (ref === 'FR4.5') return ['Partial','Guest cart exists in `cartService` (AsyncStorage), but `CartScreen` currently shows empty for guests (no guest cart UI)'];
  if (/^FR4\./.test(ref)) return ['Yes','Cart via `cartService` + `CartScreen` (Firestore for verified users)'];

  if (/^FR3\./.test(ref)) return ['Yes','Catalog/search/filter via `ProductListScreen` + `productCatalogService` + categories'];
  if (/^FR2\./.test(ref)) return ['Yes','Profile via `userService` + profile screens + onboarding gate'];
  if (/^FR1\./.test(ref)) return ['Yes','Auth via Firebase in `authService` + auth screens + AppNavigator gating'];

  return ['Partial',`Could not confidently map ${ref} to code automatically; needs manual confirmation`];
}

function findReference(startIdx){
  for (let j=startIdx+1;j<Math.min(lines.length,startIdx+60);j++){
    if (/^###\s+/.test(lines[j])) break;
    const m = /^-\s*\*\*Reference\*\*:\s*(.+)\s*$/.exec(lines[j]);
    if (m) return m[1].trim();
  }
  return null;
}

let updated = 0;
for (let i=0;i<lines.length;i++){
  if (!/^###\s+TC-/.test(lines[i])) continue;

  const ref = findReference(i);
  const [v,e] = verdict(ref);
  const implLine = `- **Implemented in code**: ${v} — ${e}`;

  if (lines[i+1] && /^-\s*\*\*Implemented in code\*\*:/.test(lines[i+1])) {
    if (lines[i+1] !== implLine) {
      lines[i+1] = implLine;
      updated++;
    }
  } else {
    lines.splice(i+1,0,implLine);
    updated++;
    i++; // skip inserted line
  }
}

fs.writeFileSync(FILE, lines.join('\n'),'utf8');
console.log(`Updated ${updated} Implemented-in-code lines.`);
