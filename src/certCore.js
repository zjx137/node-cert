const forge = require('node-forge')
const fs = require('fs')

class certCore {
    constructor(option) {
        this.keyPair= option.keyPair || 2048
        this.defaultAttrs = [
            { name: 'countryName', value: 'CN' },
            { name: 'organizationName', value: 'node-cert' },
            { shortName: 'ST', value: 'ZJ' },
            { shortName: 'OU', value: 'node-cert' }
        ]
    }
    getA() {
        return this.keyPair
    }
    getKeysAndCert (serialNumber) {
        const keys = forge.pki.rsa.generateKeyPair(this.keyPair)
        const cert = forge.pki.createCertificate()
        cert.publicKey = keys.publicKey
        cert.serialNumber = serialNumber || (Math.floor(Math.random() * 100000) + '')
        const now = Date.now()

        cert.validity.notBefore = new Date(now - 24 * 60 * 60 * 1000)
        cert.validity.notAfter = new Date(now + 361 * 24 * 60 * 60 * 1000)
        return {
            keys,
            cert
        }
    }
    generateCertByHost (host) {

    }
    generateRootCert (commonName = 'certCore') {
        const { keys,cert } = this.getKeysAndCert()
        console.log(keys)
        
        const attrs = this.defaultAttrs.concat([
            {
                name: 'commonName',
                value: commonName
            }
        ])
        cert.setSubject(attrs)
        cert.setIssuer(attrs)
        cert.setExtensions([{
            name: 'basicConstraints',
            critical: true,
            cA: true
        }, {
            name: 'keyUsage',
            critical: true,
            keyCertSign: true
        }, {
            name: 'subjectKeyIdentifier'
        }])
        // self-signed
        cert.sign(keys.privateKey, forge.md.sha256.create())

        return {
            privateKey: forge.pki.privateKeyToPem(keys.privateKey),
            publicKey: forge.pki.publicKeyToPem(keys.publicKey),
            cert: forge.pki.certificateToPem(cert)
        }
    }
}

module.exports = certCore