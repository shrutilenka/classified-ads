# Decorators

Are used in a request lifecycle, and are generally used before starting processing the request for different purposes. In Fastify they take different forms: **Handlers, Hooks, preHandlers, ...** And they do things like **Validation, Authentication**, process complex queries (like **multipart**), or a simple **Handler** that we want to use in `/routes` to decouple a little.
