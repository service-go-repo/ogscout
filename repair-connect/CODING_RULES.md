# Repair Connect - Coding Rules & Standards

## General Code Style & Formatting
- Follow the Airbnb Style Guide for code formatting.
- Use PascalCase for React component file names (e.g., UserCard.tsx, not user-card.tsx).
- Prefer named exports for components.
- Use English for all code and documentation.
- Always declare the type of each variable and function (parameters and return value).
- Avoid using any.
- Create necessary types.
- Use JSDoc to document public classes and methods.
- Don't leave blank lines within a function.
- One export per file.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

## Project Structure & Architecture
- Follow Next.js patterns and use the App Router.
- Correctly determine when to use server vs. client components in Next.js.
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

### Core System Components
- The main application logic is in src/core.
- Shared utilities and helpers are in src/utils.
- Feature flags and configuration settings are in src/config.

### Frontend Code Structure
- The UI components for the assistant are in frontend/components/assistant.
- The AI command panel logic is handled in frontend/components/command_panel.tsx.
- Styles for the AI interface are in frontend/styles/assistant.css.

### Data & Storage
- Vector embeddings are stored in server/data/vector_store.
- User session history is saved in server/data/sessions.
- Logs and analytics are collected in server/logs/usage_tracking.log.

### Testing & Debugging
- End-to-end tests for Cascade are in tests/e2e/cascade_tests.
- Mock API responses for local testing are in tests/mocks/api_mocks.py.
- Debugging scripts are located in scripts/debugging_tools.

## Styling & UI
- Use Tailwind CSS for styling.
- Use Shadcn UI for components.
- Implement responsive design with Flexbox and useWindowDimensions.
- Use styled-components or Tailwind CSS for styling.
- Implement dark mode support using Expo's useColorScheme.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Use react-native-reanimated and react-native-gesture-handler for performant animations and gestures.

## Data Fetching & Forms
- Use TanStack Query (react-query) for frontend data fetching.
- Use React Hook Form for form handling.
- Use Zod for validation.

## State Management & Logic
- Use React Context for state management.

## Backend & Database
- Use Prisma for database access.

## Naming Conventions
- Use PascalCase for classes.
- Use camelCase for variables, functions, and methods.
- Use kebab-case for file and directory names.
- Use UPPERCASE for environment variables.
- Avoid magic numbers and define constants.

## TypeScript Best Practices
- Use TypeScript for all code; prefer interfaces over types.
- Avoid any and enums; use explicit types and maps instead.
- Use functional components with TypeScript interfaces.
- Enable strict mode in TypeScript for better type safety.
- Use type hints consistently.

## Functions & Logic
- Keep functions short and single-purpose (<20 lines).
- Avoid deeply nested blocks by:
  - Using early returns.
  - Extracting logic into utility functions.
- Use higher-order functions (map, filter, reduce) to simplify logic.
- Use arrow functions for simple cases (<3 instructions), named functions otherwise.
- Use default parameter values instead of null/undefined checks.
- Use RO-RO (Receive Object, Return Object) for passing and returning multiple parameters.
- Use the function keyword for pure functions.

## Data Handling
- Avoid excessive use of primitive types; encapsulate data in composite types.
- Avoid placing validation inside functions—use classes with internal validation instead.
- Prefer immutability for data:
  - Use readonly for immutable properties.
  - Use as const for literals that never change.

## Syntax & Formatting
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.

## Python/ML Specific (if applicable)
- You are a PyTorch ML engineer
- Use type hints consistently
- Optimize for readability over premature optimization
- Write modular code, using separate files for models, data loading, training, and evaluation
- Follow PEP8 style guide for Python code
- Use Python 3 as the primary programming language
- Use PyTorch for deep learning and neural networks
- Use NumPy for numerical computing and array operations
- Use Pandas for data manipulation and analysis
- Use Jupyter for interactive development and visualization
- Use Conda for environment and package management
- Use Matplotlib for data visualization and plotting

## Teaching & Learning Guidelines
- Do not give code unless explicitly asked for it.
- Guide in problem-solving instead of providing direct answers.
- When asked about programming concepts, give direct and clear explanations.
- Break problems into smaller, manageable steps.
- Ask leading questions and provide hints instead of just telling the answer.
- Encourage debugging independently before offering suggestions.
- Refer to relevant documentation instead of providing solutions.
- Encourage modular thinking—breaking problems into reusable components.
- Remind to reflect on what was learned after solving an issue.
- If explicitly asked for code (e.g., "Give me the code"), then provide it.
- Encourage reading and understanding error messages instead of just fixing issues.
- Help identify patterns in mistakes to improve debugging skills.
- Suggest different approaches instead of leading to one specific solution.
- Guide toward using console.log(), browser dev tools, and other debugging techniques.
- Help understand how to search effectively (e.g., Googling error messages or checking documentation).

## Cascade Specific
- Cascade's backend logic is in server/cascade_engine.
- All API request handlers for Cascade are in server/cascade_api.
- Cascade's task execution queue is managed in server/cascade_tasks/queue.py.

## Code Quality Standards
- Write clean, readable, and maintainable code
- Use meaningful variable and function names
- Add comments for complex logic
- Follow DRY (Don't Repeat Yourself) principles
- Implement proper error handling
- Write unit tests for critical functionality
- Use version control best practices
- Conduct code reviews before merging
- Document API endpoints and data structures
- Follow security best practices

## Performance Guidelines
- Optimize for performance where necessary
- Use lazy loading for components and data
- Implement proper caching strategies
- Minimize bundle size
- Use code splitting for large applications
- Optimize images and assets
- Monitor and measure performance metrics

## Accessibility Standards
- Follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Provide proper ARIA labels and roles
- Ensure keyboard navigation support
- Maintain proper color contrast ratios
- Test with screen readers
- Provide alternative text for images

## Security Best Practices
- Validate and sanitize all user inputs
- Use HTTPS for all communications
- Implement proper authentication and authorization
- Store sensitive data securely
- Use environment variables for secrets
- Implement rate limiting
- Keep dependencies updated
- Follow OWASP security guidelines