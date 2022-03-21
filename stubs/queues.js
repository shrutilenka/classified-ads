const Queue = require('bull')
// const path = require('path')
// const queue = new Queue('video transcoding', 'redis://127.0.0.1:6379')
// console.log(path.join(__dirname, 'worker.js'))
// queue.process(path.join(__dirname, 'worker.js'))


const queue = new Queue("myQueue");

const main = async () => {
    await queue.add({ name: "John", age: 30 });
};

queue.process((job, done) => {
    console.log(job.data);
    done();
});

main().catch(console.error);
