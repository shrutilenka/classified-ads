import { nearestCities } from 'cityjs'
import S from 'fluent-json-schema'
import { fetchWeather, fetchWeather0, formatCities, messages } from '../../services/wv/helpers'

async function routes(fastify, options) {
    const { redis } = fastify
    fastify.get('/', async function (req, reply) {
        reply.view('/templates/pages/wv/index', {
            key: process.env.GOOGLE_MAPS_API_KEY,
            lang: 'en',
            messages,
        })
    })

    fastify.get('/fr', async function (req, reply) {
        reply.view('/templates/pages/wv/index_fr', {
            key: process.env.GOOGLE_MAPS_API_KEY,
            lang: 'en',
            messages,
        })
    })

    fastify.get('/ar', async function (req, reply) {
        reply.view('/templates/pages/wv/index_en', {
            key: process.env.GOOGLE_MAPS_API_KEY,
            lang: 'en',
            messages,
        })
    })

    fastify.get('/weather_map_view', async function (req, reply) {
        reply.view('/templates/pages/wv/weather_map_view', {
            key: process.env.GOOGLE_MAPS_API_KEY,
        })
    })

    fastify.get('/weatherMap/:url', async function (req, reply) {
        if (!req.params.url) {
            return res.status(400).send({
                error: true,
                message: 'Bad request',
                data: 'Bad request',
            })
        }
        const urlParams = JSON.parse(req.params.url)
        let westLng, northLat, eastLng, southLat, mapZoom
        ;({ westLng, northLat, eastLng, southLat, mapZoom } = urlParams)
        const action = fetchWeather0(westLng, northLat, eastLng, southLat, mapZoom)
        Promise.resolve(action).then(function (response) {
            return res.status(200).send({
                error: false,
                message: 'Weather data for weather map',
                data: response.data,
            })
        })
    })

    let language = 'en'
    const reqSchema = S.object()
        .prop('lat', S.number().min(-90).max(90).required())
        .prop('lng', S.number().min(-180).max(180).required())
        .prop('cityname', S.string().min(3).max(180).required())
        .prop('language', S.string().min(2).max(2).required())

    fastify.get('/nearby/:city', { schema: { body: reqSchema } }, async function (req, reply) {
        try {
            if (!req.params.city) {
                reply.status(400)
                return res.send({
                    error: true,
                    message: 'Bad request',
                    data: 'Bad request',
                })
            }

            const geometry = JSON.parse(req.params.city)
            const cityname = geometry.cityname
            language = geometry.language

            // Check the redis store for the data first
            redis.get(`wv:${cityname}`, async (err, result) => {
                // redis unexpected errors
                if (err) {
                    console.error(err)
                    reply.status(500)
                    return reply.send({
                        error: true,
                        message: 'Server error',
                        data: 'Server error',
                    })
                }
                if (result) {
                    return reply.send({
                        error: false,
                        message: `Weather data for nearby cities for ${cityname} from the cache`,
                        data: JSON.parse(result),
                    })
                }
                const query = {
                    latitude: geometry.lat,
                    longitude: geometry.lng,
                }
                const cities = nearestCities(query, 10)
                const actions = cities.map((city) => {
                    return fetchWeather(city, language)
                })
                Promise.all(actions).then(function (forecasts) {
                    var weathers = forecasts.map((elem) => {
                        return elem.weather
                    })
                    var pollutions = forecasts.map((elem) => {
                        return elem.pollution
                    })
                    const result = formatCities(cities, weathers, pollutions)
                    await redis.setex(`wv:${cityname}`, 24 * 60 * 3, JSON.stringify(result))
                    return reply.send({
                        error: false,
                        message: 'Weather data for nearby cities from the server',
                        data: result,
                    })
                })
            })
        } catch (error) {
            console.log(error)
        }
    })
}

export default routes
