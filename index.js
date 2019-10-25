const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const faker = require('faker')
const util = require('util')

app.get('/', (req, res) => {
    res.send('Running OK')
})

let total = 0
function emitDonation() {
    const donation = {
        id: faker.random.uuid(),
        name: faker.internet.userName(),
        comment: faker.lorem.sentences(5),
        amount: faker.random.number({ min: 1, max: 1250, precision: 0.01 }),
        date_created: new Date()
    }

    io.emit('donation', donation)
    console.log(`> Emitting donation: ${util.inspect(donation)}`)

    total += donation.amount

    io.emit('total', total)
    console.log(`> Emitting total: ${total}`)
}

function scheduleDonation() {
    const timeout = faker.random.number({ min: 5000, max: 15000 })
    console.log(`Emitting next donation in ${timeout} milliseconds`)

    setTimeout(() => {
        emitDonation()
        scheduleDonation()
    }, timeout)
}

const isInteractive = process.argv.includes('--interactive')
const mode = isInteractive ? 'interactive' : 'automatic'
console.log(`Starting server in ${mode} mode`)

server.listen(8081, () => {
    console.log(`Listening on port 8081`)
})

if (isInteractive) {
    process.stdin.on('data', () => {
        emitDonation()
    })
}
else {
    scheduleDonation()
}