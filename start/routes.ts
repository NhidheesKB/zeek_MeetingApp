import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const LoginController = () => import('#controllers/login_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const NewMeetingsController = () => import('#controllers/new_meetings_controller')
const AudioController = () => import('#controllers/audio_controller')
const MeetinghandlersController = () => import('#controllers/meetinghandlers_controller')
// router.on('/').renderInertia('home').as('dashboard')
router
  .group(() => {
    router.get('/available-meetings', [DashboardController, 'dashboard']).as('dashboard')
    router.get('/', [MeetinghandlersController, 'handleMeeting']).as('meeting')
    router.post('/meeting', [NewMeetingsController, 'newMeeting'])
    router.post('/upload', [AudioController, 'translateAudio'])
  })
  .use(middleware.auth())

router.on('/login').renderInertia('login').as('login')
router.post('/login', [LoginController, 'login'])
