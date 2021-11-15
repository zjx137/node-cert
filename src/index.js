const forge = require('node-forge')
const certCore = require('./certCore')

class Cert extends certCore {
    constructor(option) {
        super(option)
    }
}

// test
let option = {}
let a = new Cert(option)

console.log(a.generateRootCert())

// module.exports = Cert