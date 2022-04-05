const { ordersQueue, createNewOrder } = require('./orders-queue')

createNewOrder({ name: 'order1', price: 10 })
createNewOrder({ name: 'order2', price: 5 })
createNewOrder({ name: 'order3', price: 20 })
createNewOrder({ name: 'order4', price: 100 })