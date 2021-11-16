const forge = require('node-forge')
const certCore = require('./certCore')

class Cert extends certCore {
    constructor(option) {
        super(option)
    }
}

// test

async function test() {
    let option = {}
    let a = new Cert(option)
    let res = await a.generateRootCert()
    console.log(res)
    
}

test()
// console.log(a.generateRootCert())

// module.exports = Cert