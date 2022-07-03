import { getChannels, newSocket } from './sockets/refresh.js'

recoverState()
if (newSocket()) getChannels()
