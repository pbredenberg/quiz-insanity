import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import UserProfileForm from '../components/UserProfileForm.vue';
import QuizCreator from '../components/QuizCreator.vue';
import QuizTaker from '../components/QuizTaker.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfileForm,
  },
  {
    path: '/create',
    name: 'CreateQuiz',
    component: QuizCreator,
  },
  {
    path: '/quizzes',
    name: 'TakeQuiz',
    component: QuizTaker,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
