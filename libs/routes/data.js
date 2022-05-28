import { give } from "../services/data.js";

async function routes(fastify, options, next) {
    ;[
        ['/get_tags_en', give.googleTagsEn],
        ['/get_tags_ar', give.googleTagsAr],
        ['/get_tags_fr', give.googleTagsFr],
        ['/get_donations_tags_en', give.googleTagsEnLite],
        ['/get_donations_tags_ar', give.googleTagsArLite],
        ['/get_donations_tags_fr', give.googleTagsFrLite],
        ['/get_skills_tags_en', give.ESCOTagsEn],
        ['/get_skills_tags_fr', give.ESCOTagsFr],
        ['/get_skills_tags_ar', give.ESCOTagsAr],
        ['/get_events_tags_en', give.cptallTagsEn],
        ['/get_events_tags_ar', give.cptallTagsAr],
        ['/get_events_tags_fr', give.cptallTagsFr],
    ].forEach(([url, tags]) => {
        fastify.get(url, async (request, reply) => reply.send({ tags }))
    })
}

export default routes
