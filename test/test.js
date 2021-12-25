// test
const Cert = require('../src/index')
const fs = require('fs')
const path = require('path')

async function test() {
    let option = {}
    let a = new Cert(option)
    let res = await a.getRootCAKey()
    let res2 = await a.getHostCACert('baidu.com')
    console.log(res2)
    
}

test()