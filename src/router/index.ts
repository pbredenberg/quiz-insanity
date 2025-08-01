import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import UserProfileForm from '../components/UserProfileForm.vue';
import QuizCreator from '../components/QuizCreator.vue';
import QuizTaker from '../components/QuizTaker.vue';
import QuizImport from '../components/QuizImport.vue';
import QuizEditor from '../components/QuizEditor.vue';

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
  {
    path: '/import',
    name: 'ImportQuiz',
    component: QuizImport,
  },
  {
    path: '/quiz/create',
    name: 'ManualQuizCreate',
    component: QuizEditor,
  },
  {
    path: '/quiz/edit/:id',
    name: 'ManualQuizEdit',
    component: QuizEditor,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
