/* eslint-disable no-undef */

db.createUser({
    user: 'admin',
    pwd: 'admin',
    roles: [
        {
            role: 'readWrite',
            db: 'listings_db',
        },
    ],
});

db = new Mongo().getDB("listings_db");

db.createCollection('users', { capped: false });
db.createCollection('words', { capped: false });
db.createCollection('listing', { capped: false });
db.createCollection('userstemp', { capped: false });
db.createCollection('comments', { capped: false });

