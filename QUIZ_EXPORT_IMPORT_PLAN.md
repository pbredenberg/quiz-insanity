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

### Phase 2: Backend Import Implementation

- [ ] Create import function to parse JSON quiz files
- [ ] Add validation for imported quiz data
- [ ] Implement error handling for malformed files
- [ ] Add support for importing from different formats
- [ ] Create data migration for older quiz formats (if needed)

### Phase 3: Storage Implementation

- [ ] Design storage schema for quizzes
- [ ] Implement storage solution (Netlify KV, external DB, etc.)
- [ ] Create CRUD operations for quiz storage
- [ ] Add user association for quizzes (if applicable)
- [ ] Implement backup and recovery mechanisms

### Phase 4: Frontend Export UI

- [ ] Add export button/menu to quiz view
- [ ] Create format selection dropdown
- [ ] Implement download handling in the browser
- [ ] Add progress indicators for export process
- [ ] Create success/error notifications

### Phase 5: Frontend Import UI

- [ ] Create import button/form
- [ ] Implement file upload component
- [ ] Add drag-and-drop support
- [ ] Create preview of imported quiz
- [ ] Add validation feedback for users

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

We have implemented the basic JSON export functionality with file download capability. The function accepts a quiz object and returns a properly formatted JSON file with appropriate headers for browser download.

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

1. Complete the remaining export formats
2. Begin implementation of the import functionality
3. Design and implement the storage solution
4. Create the frontend components for export and import

## Testing Strategy

- Unit tests for export/import functions
- Integration tests for API endpoints
- Browser compatibility testing for download/upload
- Validation testing for imported data
