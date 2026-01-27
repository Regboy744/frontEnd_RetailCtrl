# Price Check Recalculation Plan

## Goal

Enable frontend-side recalculation of "best price" logic when users toggle supplier visibility (hide/show columns) in the Price Check feature. This ensures a responsive UI without re-fetching data from the backend, handling potential large datasets (10k+ products) efficiently using Vue's computed properties.

## Architecture

### 1. State Management (`usePriceCheck.ts`)

- Add `hiddenSupplierIds` state (Set<string>) to track visibility.
- Implement `toggleSupplier(id)` action.
- Update `activeSuppliers` computed to filter out hidden suppliers.
- **CRITICAL:** Implement `processedProducts` computed property. This is the core engine:
  - Iterates over all products.
  - For each product, finds the best price _only among active suppliers_.
  - Recalculates `best_supplier_id`, `best_supplier_price`, `order_is_best`, `potential_savings`.
  - Updates `threshold_context` (nullify if the threshold supplier is hidden).
- Implement `processedSummary` computed property:
  - Re-aggregates totals (total cost, savings, etc.) based on the new `processedProducts`.
  - Recalculates `supplier_totals` for active suppliers.
  - Determines the new `best_supplier` and `best_overall` recommendation.

### 2. UI Components

#### `PriceComparisonTable.vue`

- Update the "Dynamic Supplier Columns" loop to use `activeSuppliers` instead of all suppliers.
- Add a "Manage Columns" dropdown (using `DropdownMenu`) to allow users to toggle supplier visibility.
  - List all available suppliers with checkboxes.
  - Bind to `hiddenSupplierIds` via the `toggleSupplier` action.

#### `PriceCheckSummary.vue`

- Automatically updates because it accepts `summary` and `suppliers` props, which will now be the _processed_ versions from `usePriceCheck`.

## Implementation Steps

1.  **Modify `usePriceCheck.ts`**:
    - Add state and toggle logic.
    - Implement complex computed properties for `processedProducts` and `processedSummary`.
    - Expose `toggleSupplier`, `hiddenSupplierIds`, and `allSuppliers` (for the toggle menu).

2.  **Update `PriceComparisonTable.vue`**:
    - Inject `toggleSupplier` and `hiddenSupplierIds` (or pass as props/emit events if preferred, but direct composable usage is cleaner here given the shared state).
    - Add the "Columns" dropdown menu to the table header area.
    - Ensure the table columns iterate over the _filtered_ `suppliers` list.

## Considerations

- **Performance:** With 10k products, the `processedProducts` computed might be heavy. Vue's reactivity system is generally efficient, but we should ensure the loop is optimized (e.g., break early, avoid unnecessary object cloning if possible, though immutability is safer).
- **Thresholds:** The backend logic for thresholds is complex. Frontend recalculation is an approximation. If a supplier is hidden, we can't easily "re-evaluate" a threshold for a _different_ supplier without all the config data. The safe bet is to only show threshold context if the originally calculated threshold supplier is still the winner.

## Verification

- Upload a test file.
- Toggle a supplier off.
- Verify:
  - The column disappears.
  - "Best Price" cells update if the hidden supplier was previously the best.
  - Summary cards (Max Savings, etc.) update.
  - "Best Supplier" banner updates if the leader changes.
