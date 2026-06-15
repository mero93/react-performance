### 1. Sorting Countries

- **Render Duration:** 243 ms
- **Commit Duration:** < 0.1 ms (Layout/Passive effects)
- **What Caused Update:** Root `App` component state change
- **Bottleneck Analysis:** Toggling the sorting criteria results in a heavy **243ms** rendering delay. The **Flamegraph** reveals a massive, uninterrupted block of sequential rendering operations, while the **Ranked Chart** details that parent elements like `App` (7ms), `YearSelector` (6ms), and `CountryList` (5ms) are computationally lightweight on their own. The true bottleneck is cumulative: the entire grid structure—specifically the un-memoized `CountryCard` elements (e.g., keys 241, 8, 83, 236) and internal `DataTable` structures—runs its evaluation cycles completely from scratch across the entire dataset when the sort order shifts.

- **Screenshots:**

![alt text](image-2.png)
![alt text](image-3.png)

---

### 2. Searching for a Country

- **Render Duration:** 279 ms
- **Commit Duration:** < 0.1 ms (Layout/Passive effects)
- **What Caused Update:** Root `App` component state mutation (Search text query updated)
- **Bottleneck Analysis:** Typing a search query triggers a global dataset filter, showing an expensive **279ms** rendering duration. The **Flamegraph** captures a dense sea of simultaneous child execution blocks under `CountryList`, while the **Ranked Chart** shows that the parent `CountryList` layout wrapper single-handedly demands **78ms** just to handle the un-optimized data structures. The remainder of the 279ms is drained sequentially by individual `CountryCard` structures and `DataTable` sub-elements. Because there is no list virtualization or reference caching, typing even a single character forces the browser to discard hundreds of old nodes and mount new ones simultaneously, causing noticeable thread blocks.
- **Profile Attachment:**

![alt text](image-12.png)
![alt text](image-13.png)

---

### 3. Selecting a Different Year

- **Render Duration:** 348 ms
- **Commit Duration:** < 0.1 ms (Layout/Passive effects)
- **What Caused Update:** Root `App` component state change selection
- **Bottleneck Analysis:** Changing the global year filter yields the highest baseline lag spike at **348ms**. The **Ranked Chart** captures severe structural bottlenecks: the parent `CountryList` wrapper single-handedly spends **108ms** processing the updated dataset array, while the un-memoized child cards sequentially drain the remaining **240ms**. Without data derivation memoization or row caching, a single dropdown click forces the browser to hang for over a third of a second.
- **Screenshots:**

![alt text](image-10.png)
![alt text](image-11.png)

---

### 4. Toggling Columns

- **Render Duration:** 299 ms
- **Commit Duration:** < 0.1 ms (Layout/Passive effects)
- **What Caused Update:** Root `App` state change selection
- **Bottleneck Analysis:** Changing column visibility settings causes a major lag spike of **299ms**. The **Flamegraph** and **Ranked Chart** clearly expose the structural weakness: the parent `CountryList` wrapper spends **85ms** processing the structural change, while the rest of the execution time is drained by an un-memoized cascade of nested child grids. Even though the underlying emissions data hasn't changed at all, toggling a column visibility checkbox forces every single row and data cell to completely recalculate and re-evaluate its layout from scratch.
- **Screenshots:**

![alt text](image-8.png)
![alt text](image-9.png)

---
