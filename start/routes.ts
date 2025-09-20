import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const LoginController = () => import('#controllers/login_controller')
const DashboardController=()=> import('#controllers/dashboard_controller')
// router.on('/').renderInertia('home').as('dashboard')
router.group(() => {
  router.get('/',[DashboardController,'Dashboard']).as('dashboard')
  router.on('/login').renderInertia('Login').as('login')
}).use(middleware.auth())

router.post('/login', [LoginController, 'Login'])
