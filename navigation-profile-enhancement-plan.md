# Profile Navigation Enhancement Plan

## Overview
This plan details the implementation of two specific navigation enhancements:

1. Move the Profile link to the far right (after "My Quizzes")
2. Replace the "Profile" text with the user's Gravatar avatar when available

## Current Implementation

The navigation menu is currently implemented in `Layout.vue` with links in this order:
- Home
- Profile (to be moved and enhanced)
- Create Quiz
- My Quizzes

## Detailed Implementation Plan

### Task 1: Reorder Navigation Links

- [x] Identify navigation structure in `Layout.vue`
- [ ] Move Profile `router-link` to appear after "My Quizzes" link
- [ ] Test navigation order works correctly

### Task 2: Add Gravatar Integration

#### 2.1: Store Integration
- [ ] Import the user profile store in `Layout.vue`:
  ```typescript
  import { useUserProfileStore } from '../stores/userProfile';
  ```
- [ ] Create a store reference in the component:
  ```typescript
  const userProfileStore = useUserProfileStore();
  ```

#### 2.2: Import Gravatar Utility
- [ ] Import the existing Gravatar utility:
  ```typescript
  import { getGravatarUrl } from '../utils/gravatar';
  ```

#### 2.3: Create Computed Properties
- [ ] Add computed property for user email:
  ```typescript
  const userEmail = computed(() => userProfileStore.userEmail);
  ```
- [ ] Add computed property for avatar URL:
  ```typescript
  const avatarUrl = computed(() => getGravatarUrl(userEmail.value, 32));
  ```
- [ ] Add computed property to determine if user is logged in:
  ```typescript
  const isLoggedIn = computed(() => userProfileStore.isLoggedIn);
  ```

### Task 3: Update Profile Link to Show Avatar

- [ ] Modify the Profile router-link to conditionally display either text or avatar:
  ```html
  <router-link
    to="/profile"
    class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
    active-class="text-white bg-gray-700"
  >
    <!-- Show avatar if logged in -->
    <template v-if="isLoggedIn && userEmail">
      <img
        :src="avatarUrl"
        :alt="userProfileStore.userName"
        class="w-8 h-8 rounded-full"
      />
    </template>
    <!-- Otherwise show text -->
    <template v-else>
      Profile
    </template>
  </router-link>
  ```

### Task 4: Style Enhancements

- [ ] Add CSS for avatar to ensure correct sizing and appearance:
  ```css
  .avatar-img {
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: border-color 0.2s ease;
  }

  .router-link-active .avatar-img,
  .router-link:hover .avatar-img {
    border-color: rgba(255, 255, 255, 0.6);
  }
  ```

- [ ] Ensure avatar is vertically aligned with text links:
  ```html
  <nav class="flex space-x-4 items-center">
    <!-- Navigation links -->
  </nav>
  ```

## Implementation Notes

1. **iOS Comparison**: This implementation is similar to a `NavigationView` in SwiftUI where we conditionally swap between a text and image-based navigation item.

2. **Performance Considerations**: The computed properties ensure we only re-render when necessary, similar to how SwiftUI views only update when their dependencies change.

3. **Accessibility**: We'll maintain the alt text for the avatar image to ensure screen readers can still identify the profile link.

## Timeline

- Estimated Implementation Time: 30 minutes
- Testing: 15 minutes
