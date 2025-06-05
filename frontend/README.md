This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Frontend Testing

### Testing Approach
- **Testing Infrastructure:**  
  - **Jest** is used as the test runner.
  - **React Testing Library (RTL)** is used for component testing.
  - **Mock Service Worker (MSW)** is used for API mocking.
  - **TypeScript** support is enabled with proper type definitions.

- **Test Organization:**  
  - Tests are placed in `__tests__` directories next to the components they test.
  - Each test file focuses on a single component.
  - Tests are organized by component state and functionality.

- **Testing Strategy:**  
  - **Component States:** Testing different states (loading, error, empty, populated).
  - **User Interactions:** Testing click handlers, form submissions, etc.
  - **Data Flow:** Testing how components handle data from hooks and stores.
  - **Filtering Logic:** Testing search and filter functionality.
  - **Edge Cases:** Testing empty states and error conditions.

- **Mocking Strategy:**  
  - External dependencies (hooks, stores) are mocked.
  - Realistic mock data is used to match the application's data structure.
  - Components are isolated for unit testing.

### Test Cases for ProjectSelector
- **Loading State:** Ensures the loading state is rendered correctly with `role="status"`.
- **Error State:** Verifies that error messages are displayed when data loading fails.
- **Empty State:** Checks that the component shows a message when no projects exist.
- **Project List Rendering:** Confirms that all projects are rendered with their details.
- **Project Selection:** Tests that clicking on a project triggers the correct action.
- **Expansion/Collapse Functionality:** Ensures the component toggles visibility correctly.
- **"All Projects" Option:** Verifies that the "All Projects" option is displayed and works as expected.

### Test Cases for TranslationKeyManager
- **Loading State:** Ensures the loading state is rendered correctly.
- **Error State:** Verifies that error messages are displayed when data loading fails.
- **No Project Selected State:** Checks that the component prompts the user to select a project.
- **Translation Keys List Rendering:** Confirms that all translation keys are rendered with their details.
- **Search Filtering:** Tests that the component filters translation keys based on search input.
- **Category Filtering:** Verifies that the component filters translation keys based on selected categories.
- **Language Filtering:** Ensures that the component filters translation keys based on selected languages.
- **No Results Message:** Checks that the component displays a message when no translation keys match the filters.

### Running Tests
To run the tests, use the following command:
```bash
npm test
```

For watch mode during development, use:
```bash
npm run test:watch
```
