const forge = require('node-forge')
const certCore = require('./certCore')

class Cert extends certCore {
    constructor(option) {
        super(option)
    }
    getRootCAKey () {
        return new Promise((resolve, reject) => {
            this.generateRootCert().then(res => resolve(res.privateKey), err => reject(err))
        })
    }
    getRootCACert () {
        return new Promise((resolve, reject) => {
            this.generateRootCert().then(res => resolve(res.cert), err => reject(err))
        })
    }
    getRootCA () {
        return new Promise((resolve, reject) => {
            this.generateRootCert().then(res => resolve(res), err => reject(err))
        })
    }
    getHostCAKey (host) {
        return new Promise((resolve, reject) => {
            this.getRootCA().then(rootCA => {
                this.generateCertByHost(host, rootCA).then(res => resolve(res.privateKey), err => reject(err))
            }, err => reject(err))
        })
    }
    getHostCACert (host) {
        return new Promise((resolve, reject) => {
            this.getRootCA().then(rootCA => {
                this.generateCertByHost(host, rootCA).then(res => resolve(res.cert), err => reject(err))
            }, err => reject(err))
        })
    }
}

module.exports = Cert