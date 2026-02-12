# Updates Required for View Entries

## 1. Update index.html - Add Entry Type Filter

Find the filter section in index.html and replace with:

```html
<div class="filter-section">
    <div class="filter-group">
        <label>Filter by Entry Type</label>
        <select id="filterEntryType" class="filter-input">
            <option value="all">All Entries</option>
            <option value="Work">Work Only</option>
            <option value="Leave">Leave Only</option>
        </select>
    </div>
    <div class="filter-group">
        <label>Filter by Date Range</label>
        <div class="filter-row">
            <input type="date" id="filterFromDate" class="filter-input">
            <span>to</span>
            <input type="date" id="filterToDate" class="filter-input">
            <button class="btn btn-secondary btn-sm" id="applyFilterBtn">Apply</button>
            <button class="btn btn-ghost btn-sm" id="clearFilterBtn">Clear</button>
        </div>
    </div>
</div>
```

## 2. Update script.js - Replace populateEntriesTable function

Replace the existing populateEntriesTable function with pagination support.

## 3. Update script.js - Update Apply Filter Button

```javascript
document.getElementById('applyFilterBtn').addEventListener('click', () => {
    const fromDate = document.getElementById('filterFromDate').value;
    const toDate = document.getElementById('filterToDate').value;
    const entryType = document.getElementById('filterEntryType').value;
    UI.filterEntries(fromDate, toDate, entryType);
});
```

## 4. Update script.js - Update Clear Filter Button

```javascript
document.getElementById('clearFilterBtn').addEventListener('click', () => {
    document.getElementById('filterFromDate').value = '';
    document.getElementById('filterToDate').value = '';
    document.getElementById('filterEntryType').value = 'all';
    AppState.filteredEntries = AppState.entries;
    AppState.currentPage = 1;
    UI.populateEntriesTable();
});
```

## 5. Add CSS for Pagination

```css
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    padding: 15px;
}

.page-info {
    padding: 0 15px;
    font-weight: 600;
}

.table-info {
    padding: 10px 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}
```

All dates are now formatted properly (no more ISO format).
Entries are sorted newest first.
Pagination shows 10 items per page.
Entry type filter added.
