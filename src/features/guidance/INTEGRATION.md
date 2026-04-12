# Phase 5: Visual Guidance GIFs - Integration Guide

## Overview

This guide explains how to integrate the guidance GIF system into your screens.
The system provides visual tutorials and contextual help for first-time users.

## Quick Start

### 1. Import the components

```tsx
import {
  GuidanceTooltipWrapper,
  PortionGuideCard,
  isFeatureEnabled,
} from '@/features/guidance';
```

### 2. Add contextual tooltips

```tsx
// Wrap any feature with GuidanceTooltipWrapper
// It will show a tooltip on first use, then never again

<GuidanceTooltipWrapper gifKey="quickLog">
  <QuickLogSection />
</GuidanceTooltipWrapper>
```

### 3. Add portion guide to food details

```tsx
// In your food detail page
<PortionGuideCard defaultExpanded={false} />
```

---

## Integration Points

### Dashboard (Quick Log Tooltip)

**File:** `src/app/(app)/dashboard/page.tsx`

```tsx
import { GuidanceTooltipWrapper } from '@/features/guidance';
import { isFeatureEnabled } from '@/lib/featureFlags';

export default function DashboardPage() {
  return (
    <main>
      {/* Existing dashboard content */}

      {/* Wrap Quick Log section with guidance tooltip */}
      {isFeatureEnabled('guidanceGifs') ? (
        <GuidanceTooltipWrapper gifKey="quickLog">
          <QuickLogSection />
        </GuidanceTooltipWrapper>
      ) : (
        <QuickLogSection />
      )}
    </main>
  );
}
```

### Onboarding (Barcode & Search GIFs)

**File:** `src/app/(app)/onboarding/page.tsx`

```tsx
import { GuidanceGif, isFeatureEnabled } from '@/features/guidance';

export default function OnboardingPage() {
  return (
    <div className="onboarding-steps">
      {/* Step 1: Barcode Scanning */}
      <div className="step">
        {isFeatureEnabled('guidanceGifs') && (
          <GuidanceGif gifKey="barcodeScanning" showCaption />
        )}
        <p>Scan any barcode to instantly find nutrition info</p>
      </div>

      {/* Step 2: Food Search */}
      <div className="step">
        {isFeatureEnabled('guidanceGifs') && (
          <GuidanceGif gifKey="foodSearch" showCaption />
        )}
        <p>Or search for any food, brand, or restaurant</p>
      </div>
    </div>
  );
}
```

### Food Detail (Portion Guide)

**File:** `src/app/(app)/nutrition/[id]/page.tsx`

```tsx
import { PortionGuideCard, isFeatureEnabled } from '@/features/guidance';

export default function FoodDetailPage() {
  return (
    <div className="food-detail">
      {/* Food info, macros, etc. */}

      {/* Portion guide card */}
      {isFeatureEnabled('guidanceGifs') && (
        <PortionGuideCard className="mt-4" />
      )}
    </div>
  );
}
```

### Search Empty State

**File:** `src/app/(app)/nutrition/search/page.tsx`

```tsx
import { GuidanceGif, isFeatureEnabled } from '@/features/guidance';

function EmptyState() {
  return (
    <div className="empty-state">
      {isFeatureEnabled('guidanceGifs') && (
        <GuidanceGif gifKey="barcodeScanning" height={160} showCaption />
      )}
      <p>Search for food or scan a barcode to get started</p>
    </div>
  );
}
```

---

## GIF Content Requirements

For production, create these GIFs and host on CDN:

| Key | Content | Location | Max Size |
|-----|---------|----------|----------|
| `barcodeScanning` | Phone scanning barcode on food package | Onboarding, Search | <500KB |
| `foodSearch` | Typing food name, results appearing | Onboarding | <500KB |
| `quickLog` | Tapping frequent food to log instantly | Dashboard | <500KB |
| `portionProtein` | Palm next to protein (chicken/steak) | Food Detail | <500KB |
| `portionCarbs` | Fist next to carbs (rice/bread) | Food Detail | <500KB |
| `portionFats` | Thumb next to fats (butter/oil) | Food Detail | <500KB |

**Update CDN URL in:** `src/features/guidance/constants.ts`

---

## Feature Flag

Toggle guidance GIFs on/off in `src/lib/featureFlags.ts`:

```typescript
export const FEATURE_FLAGS = {
  // ...
  guidanceGifs: true, // Set to false to disable
};
```

---

## Testing

1. Clear localStorage: `localStorage.removeItem('bodyglow:onboarding-progress')`
2. Refresh page
3. Navigate to feature - tooltip should appear
4. Dismiss tooltip
5. Navigate away and back - tooltip should NOT appear again
