import { getChannels, newSocket } from './sockets/refresh.js'

// let _ws = null
if (newSocket()) getChannels()
