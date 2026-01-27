# Unified Recommendation Banner Plan

## Goal

Simplify the verbose, multi-block recommendation banner in `PriceCheckSummary.vue` into a single, compact, unified row that dynamically adapts its content and style based on the recommendation state (Order Best, Supplier Best, Mixed, or Fallback).

## Current State Analysis

- **Structure:** 4 separate `v-if/else-if` blocks (lines 231–395).
- **Issues:**
  - Repetitive code for similar metrics (cost, savings).
  - Inconsistent internal layouts.
  - Excessive vertical space usage (header + breakdown section).
- **Data:** All blocks display a variation of: Title, Description/Subtitle, Total Cost, and Savings (if any).

## Proposed Changes

### 1. Logic Unification (Script)

Create a `recommendationState` computed property that maps the current state to a configuration object:

- **Keys:** `theme` (green/blue/amber), `icon`, `title`, `subtitle`, `metricLabel`, `metricValue`, `savings`.
- **States:**
  1. **Keep Order:** Blue theme, "Best Price: Current Order", no savings.
  2. **Switch Supplier:** Green theme, "Best Price: [Supplier]", shows savings.
  3. **Mixed Results:** Amber theme, "Mixed Results", shows potential lowest cost & savings.
  4. **Fallback:** Green theme, standard best supplier logic.

### 2. UI Unification (Template)

Replace the 4 blocks with a single `div` that binds to `recommendationState`.

- **Layout:** Flex row (column on mobile).
- **Left Side:** Icon + Title + Subtitle (compact).
- **Right Side:** Key Metric (Total Cost) + Savings Badge (if > 0).
- **Styling:** Dynamic classes based on `theme` (e.g., `bg-green-500/10`, `text-amber-700`).

## Execution Steps

1.  **Modify `PriceCheckSummary.vue` Script:**
    - Add `recommendationState` computed property.
    - Add `themeClasses` helper function.
2.  **Modify `PriceCheckSummary.vue` Template:**
    - Remove the extensive `v-if/else-if` blocks (lines 231–395).
    - Insert the new single-row unified component.
3.  **Verify:**
    - Check visually (user will do this).
    - Run type check.

## Code Preview

```typescript
// Computed Configuration
const recommendationState = computed(() => {
  // Logic to determine active state and return config object
  // ...
})
```

```html
<!-- Unified Banner -->
<div
  v-if="recommendationState"
  :class="themeClasses(recommendationState.theme)"
>
  <!-- Icon & Text -->
  <div class="flex items-center gap-3">
    <component :is="recommendationState.icon" />
    <div>
      <h3>{{ recommendationState.title }}</h3>
      <p>{{ recommendationState.subtitle }}</p>
    </div>
  </div>
  <!-- Metrics -->
  <div class="text-right">
    <p>{{ formatCurrency(recommendationState.metricValue) }}</p>
    <span v-if="recommendationState.savings">Save ...</span>
  </div>
</div>
```
