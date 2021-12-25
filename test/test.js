// test
const Cert = require('../src/index')
const fs = require('fs')
const path = require('path')

async function test() {
    let option = {}
    let certMgr = new Cert(option)
    let root = await certMgr.getRootCAKey()
    let res = await certMgr.getHostCACert('baidu.com')
    console.log(res)
}

test()