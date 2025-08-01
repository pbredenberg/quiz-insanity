# User Profile Enhancement Plan

This document outlines the step-by-step process to enhance the user profile with:
- Gravatar profile picture
- Description section (250 character limit)
- Interests section (as interactive tags)

**Implementation Strategy**: Each feature will be implemented individually and verified in the browser before proceeding to the next.

## Prerequisites

- [ ] Review the current user profile implementation
  - User profile form: `/src/components/UserProfileForm.vue`
  - User profile store: `/src/stores/userProfile.ts` 
  - User profile types: `/src/types/index.ts`

## ✅ Task 1: Update Type Definitions (COMPLETED)

- [x] Modify `/src/types/index.ts` to include new fields:

```typescript
// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  description?: string;        // New field
  interests?: string[];        // New field
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## ✅ Task 2: Update User Profile Store (COMPLETED)

- [x] Modify `/src/stores/userProfile.ts` to handle the new fields:

```typescript
// Add new getters
const userDescription = computed(() => profile.value?.description || '');
const userInterests = computed(() => profile.value?.interests || []);

// Update createProfile function
const createProfile = (name: string, email: string, description?: string, interests?: string[]) => {
  // ...existing code...
  const newProfile: UserProfile = {
    id: crypto.randomUUID(),
    name,
    email,
    description,
    interests,
    preferences: {
      // ...existing code...
    },
    // ...existing code...
  };
  // ...existing code...
};

// Add to return statement
return {
  // ...existing entries...
  userDescription,
  userInterests,
  // ...existing entries...
};
```

## ✅ Task 3: Create Gravatar Utility (COMPLETED)

- [x] Create a utility file for Gravatar at `/src/utils/gravatar.ts`:

```typescript
import md5 from 'md5';  // We'll need to install this dependency

export function getGravatarUrl(email: string, size = 80): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}
```

- [x] Install the md5 package:
  ```
  npm install md5
  npm install @types/md5 --save-dev
  ```

## ✅ Task 4: Update User Profile Form Component (GRAVATAR PART COMPLETED)

- [x] Add Gravatar image to `/src/components/UserProfileForm.vue`:

```html
<!-- Add this after the name field -->
<div class="mt-4 flex justify-center">
  <img
    v-if="form.email"
    :src="gravatarUrl"
    :alt="form.name || 'User'"
    class="w-24 h-24 rounded-full border-2 border-gray-600"
  />
  <div v-else class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
    <span class="text-3xl">?</span>
  </div>
</div>
```

- [x] Add script section for Gravatar:

```typescript
// Import at the top
import { getGravatarUrl } from '../utils/gravatar';

// Add computed property
const gravatarUrl = computed(() => 
  form.value.email ? getGravatarUrl(form.value.email, 96) : ''
);
```

- [x] Add Description field to the form:

```html
<!-- Add this after the email field -->
<div>
  <label
    for="description"
    class="block text-sm font-medium text-gray-300 mb-2"
  >
    Description (250 characters max)
  </label>
  <textarea
    id="description"
    v-model="form.description"
    rows="3"
    maxlength="250"
    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Tell us about yourself"
  ></textarea>
  <div class="text-xs text-gray-400 mt-1 text-right">
    {{ form.description.length }} / 250
  </div>
</div>
```

- [x] Add Interests field to the form:

```html
<!-- Add this after the description field -->
<div>
  <label
    for="interests"
    class="block text-sm font-medium text-gray-300 mb-2"
  >
    Interests (comma separated)
  </label>
  <input
    id="interests"
    v-model="interestsInput"
    type="text"
    @keydown.enter.prevent="addInterestFromInput"
    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Type and press Enter to add interests"
  />
  
  <!-- Display interests as tags -->
  <div class="flex flex-wrap gap-2 mt-2">
    <div 
      v-for="(interest, index) in interestsArray" 
      :key="index"
      class="bg-blue-700 text-white text-sm px-2 py-1 rounded-md flex items-center"
    >
      {{ interest }}
      <button 
        @click="removeInterest(index)" 
        class="ml-2 text-white hover:text-red-300"
        type="button"
      >
        &times;
      </button>
    </div>
  </div>
</div>
```

- [ ] Update form data in the script section:

```typescript
const form = ref({
  name: '',
  email: '',
  description: '',
  theme: 'dark' as 'dark' | 'light',
  notifications: true,
});

const interestsInput = ref('');

// Update onMounted to include new fields
onMounted(() => {
  if (userProfileStore.profile) {
    form.value.name = userProfileStore.profile.name;
    form.value.email = userProfileStore.profile.email;
    form.value.description = userProfileStore.profile.description || '';
    form.value.theme = userProfileStore.profile.preferences.theme;
    form.value.notifications = userProfileStore.profile.preferences.notifications;
    interestsArray.value = userProfileStore.profile.interests || [];
  }
});

// Interests as array
const interestsArray = ref<string[]>([]);

// Method to add an interest from the input
const addInterestFromInput = () => {
  const interest = interestsInput.value.trim();
  if (interest && !interestsArray.value.includes(interest)) {
    interestsArray.value.push(interest);
    interestsInput.value = '';
  }
};

// Method to remove an interest
const removeInterest = (index: number) => {
  interestsArray.value.splice(index, 1);
};
```

- [ ] Update the handleSubmit function:

```typescript
const handleSubmit = () => {
  if (isEditing.value) {
    userProfileStore.updateProfile({
      name: form.value.name,
      email: form.value.email,
      description: form.value.description,
      interests: interestsArray.value,
    });
    
    // ...existing code...
  } else {
    userProfileStore.createProfile(
      form.value.name, 
      form.value.email, 
      form.value.description, 
      interestsArray.value
    );
    
    // ...existing code...
  }
};
```

- [ ] Update the Current Profile section to display new fields:

```html
<!-- Add this after the notifications field in the Current Profile section -->
<div v-if="userProfileStore.userDescription" class="mt-2">
  <p class="text-gray-300">
    <span class="font-medium">About:</span>
    {{ userProfileStore.userDescription }}
  </p>
</div>

<div v-if="userProfileStore.userInterests && userProfileStore.userInterests.length > 0" class="mt-2">
  <p class="text-gray-300 mb-1">
    <span class="font-medium">Interests:</span>
  </p>
  <div class="flex flex-wrap gap-2">
    <span 
      v-for="(interest, index) in userProfileStore.userInterests" 
      :key="index"
      class="bg-blue-700 text-white text-sm px-2 py-1 rounded-md"
    >
      {{ interest }}
    </span>
  </div>
</div>

<!-- Add Gravatar to the Current Profile section -->
<div class="mt-4 flex justify-center">
  <img
    :src="getGravatarUrl(userProfileStore.userEmail, 96)"
    :alt="userProfileStore.userName"
    class="w-24 h-24 rounded-full border-2 border-gray-600"
  />
</div>
```

## Implementation Approach

**Important**: We'll implement each feature individually and verify it works in the browser before moving to the next feature.

### Implementation Order:

1. ✅ First implement Gravatar support and verify ✓ COMPLETED
2. ✅ Implement the description field with character limit and verify ✓ COMPLETED
3. ✅ Implement the interests tags system and verify ✓ COMPLETED

After each implementation step:
- Run the dev server
- Test the feature in the browser
- Make adjustments if needed
- Only proceed to the next feature when current one is working properly

## Implementation Decisions

- **Profile Picture**: Using Gravatar only; no custom uploads
- **Interests**: Free-form text displayed as interactive tags
- **Description**: 250 character limit with counter

**Note**: Stop and ask for feedback if any part of this plan is unclear or if you have questions about the implementation details.
