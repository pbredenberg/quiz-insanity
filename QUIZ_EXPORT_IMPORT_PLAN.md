# Quiz Insanity: Export & Import Implementation Plan

## Overview
This document outlines the implementation plan for adding export and import functionality to Quiz Insanity. This will allow users to export quizzes in various formats and import them back into the application.

## Implementation Phases

### Phase 1: Backend Export Implementation ✅

- [x] Create basic export function with JSON format
- [x] Add file download capability with proper headers
- [x] Implement automatic filename generation
- [x] Configure Netlify redirects for the export endpoint (using existing /api/* redirect)
- [ ] Add additional export formats (CSV, Markdown, PDF)
- [ ] Implement error handling and validation

### Phase 2: Backend Import Implementation ⚙️

- [x] Create import function to parse JSON quiz files
- [x] Add validation for imported quiz data
- [x] Implement error handling for malformed files
- [ ] Add support for importing from different formats
- [ ] Create data migration for older quiz formats (if needed)

### Phase 3: Storage Implementation

- [ ] Design storage schema for quizzes
- [ ] Implement storage solution (Netlify KV, external DB, etc.)
- [ ] Create CRUD operations for quiz storage
- [ ] Add user association for quizzes (if applicable)
- [ ] Implement backup and recovery mechanisms

### Phase 4: Frontend Export UI ✅

- [x] Add export button/menu to quiz view
- [ ] Create format selection dropdown (JSON only for now)
- [x] Implement download handling in the browser
- [x] Add progress indicators for export process
- [x] Create success/error notifications

### Phase 5: Frontend Import UI ⚙️

- [x] Create import button/form
- [x] Implement file upload component
- [x] Add drag-and-drop support
- [x] Create preview of imported quiz
- [x] Add validation feedback for users

## Technical Details

### Export Formats

- **JSON**: Complete quiz data in structured format
- **CSV**: Questions and answers in tabular format
- **Markdown**: Human-readable text format
- **PDF**: Formatted document for printing

### Data Models

```typescript
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

- `/.netlify/functions/export-quiz`: Export quiz in specified format
- `/.netlify/functions/import-quiz`: Import quiz from uploaded file
- `/.netlify/functions/list-quizzes`: List saved quizzes (future)
- `/.netlify/functions/save-quiz`: Save quiz to storage (future)

## Current Progress

We have completed the backend and frontend implementation of the quiz export functionality and have made significant progress on the import functionality:

### Export Backend Implementation
- Created a Netlify function (`export-quiz.ts`) that accepts a quiz object and returns a properly formatted JSON file
- Implemented automatic filename generation based on quiz title and timestamp
- Added appropriate headers for browser download
- Configured proper error handling

### Import Backend Implementation
- Created a Netlify function (`import-quiz.ts`) for processing and validating imported quiz files
- Implemented validation logic to ensure quiz data integrity
- Added functionality to generate new IDs for imported quizzes to avoid conflicts
- Configured proper error handling for malformed or invalid quiz data

### Export Frontend Implementation
- Added an export button to the quiz header, available throughout the quiz-taking process
- Added an export button to the quiz results screen
- Added export capability to each quiz in the quiz selection list
- Implemented loading indicators during export
- Added success/error notifications
- Created a dedicated API service method for quiz export

### Import Frontend Implementation
- Created a QuizImporter component with drag-and-drop and file selection capabilities
- Implemented client-side validation of imported quiz files
- Added preview functionality to show quiz title and question count before import
- Implemented loading indicators and success/error states
- Created dedicated API service methods for quiz validation and import

### Using the Export Endpoint

The export endpoint can be accessed at `/api/export-quiz` (which redirects to `/.netlify/functions/export-quiz`). Here's how to use it:

```javascript
// Example frontend code to call the export endpoint
async function exportQuiz(quiz, format = 'json', filename = null) {
  try {
    // Create the request body
    const requestBody = {
      quiz: quiz,
      format: format,
      filename: filename
    };

    // Make the request
    const response = await fetch('/api/export-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // For file downloads, we need to create a blob and download it
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename || `quiz_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting quiz:', error);
    throw error;
  }
}
```

### Next Steps

1. Complete the remaining export formats (CSV, Markdown, PDF)
2. Complete the integration of import functionality:
   - Integrate the import UI into the QuizCreator component
   - Add tab navigation between quiz creation and import
   - Connect the import UI to the store and API service
3. Design and implement the storage solution:
   - Choose appropriate storage mechanism
   - Create CRUD operations for quiz persistence
4. Enhance the import functionality:
   - Add support for different import formats
   - Improve validation and error handling
   - Add import history and tracking

## Testing Strategy

- Unit tests for export/import functions
- Integration tests for API endpoints
- Browser compatibility testing for download/upload
- Validation testing for imported data
