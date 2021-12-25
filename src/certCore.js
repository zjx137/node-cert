const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

class certCore {
    constructor(option) {
        this.keyPair= option.keyPair || 2048
        this.defaultAttrs = [
            { name: 'countryName', value: 'CN' },
            { name: 'organizationName', value: 'node-cert' },
            { shortName: 'ST', value: 'ZJ' },
            { shortName: 'OU', value: 'node-cert' }
        ]
        this.rootCAPath = option.rootCAKeyPath || path.join(__dirname, '../cert')
        if(!fs.existsSync(this.rootCAPath)) {
            fs.mkdirSync(this.rootCAPath)
        }
        // Generate root KEY/CRT Path
        this.rootCAKeyPath = path.join(this.rootCAPath, 'rootCA.key')
        this.rootCACertPath = path.join(this.rootCAPath, 'rootCA.crt')
    }
    getKeysAndCert (serialNumber) {
        // Generate RSA Keys Pair
        const keys = forge.pki.rsa.generateKeyPair(this.keyPair)
        // Generate cert
        const cert = forge.pki.createCertificate()
        cert.publicKey = keys.publicKey // 公钥塞进证书
        cert.serialNumber = serialNumber || (Math.floor(Math.random() * 100000) + '')
        const now = Date.now()

        cert.validity.notBefore = new Date(now - 24 * 60 * 60 * 1000)
        cert.validity.notAfter = new Date(now + 361 * 24 * 60 * 60 * 1000)

        return {
            keys,
            cert
        }
    }
    generateCertByHost (host, rootCA) {
        const hostCAKeyPath = path.join(this.rootCAPath, `${host}.key`)
        const hostCACertPath = path.join(this.rootCAPath, `${host}.crt`)
        return new Promise((resolve, reject) => {
            // Use Root Crt sign Host Crt
            if (this.isHostCAFilesExist(hostCACertPath, hostCAKeyPath)) {
                console.log('existed1')
                const cert = fs.readFileSync(hostCACertPath).toString()
                const privateKey = fs.readFileSync(hostCAKeyPath).toString()
                const publicKey = forge.pki.publicKeyToPem(forge.pki.certificateFromPem(cert).publicKey)
                resolve({
                    cert,
                    privateKey,
                    publicKey
                }) 
            } else {
                const md = forge.md.md5.create()
                md.update(host)
                const { keys, cert } = this.getKeysAndCert(md.digest().toHex())

                const caKey = forge.pki.privateKeyFromPem(rootCA.privateKey)
                const caCert = forge.pki.certificateFromPem(rootCA.cert)

                cert.setIssuer(caCert.subject.attributes)
                const attrs = this.defaultAttrs.concat([
                    {
                        name: 'commonName',
                        value: host
                    }
                ])
                const extensions = [
                    { name: 'basicConstraints', cA: true },
                    this.getExtensionSAN(host)
                ]
                cert.setSubject(attrs)
                cert.setExtensions(extensions)
                cert.sign(caKey, forge.md.sha256.create())
                
                fs.writeFileSync(hostCACertPath, forge.pki.certificateToPem(cert))
                fs.writeFileSync(hostCAKeyPath, forge.pki.privateKeyToPem(keys.privateKey))

                resolve ({
                    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
                    publicKey: forge.pki.publicKeyToPem(keys.publicKey),
                    cert: forge.pki.certificateToPem(cert)
                })
            }
            
        })
        
        
    }
    generateRootCert (commonName = 'certCore') {
        return new Promise((resolve, reject) => {
            if(this.isRootCAFilesExist()) {
                console.log('existed')
                const cert = fs.readFileSync(this.rootCACertPath).toString()
                const privateKey = fs.readFileSync(this.rootCAKeyPath).toString()
                const publicKey = forge.pki.publicKeyToPem(forge.pki.certificateFromPem(cert).publicKey)
                resolve({
                    cert,
                    privateKey,
                    publicKey
                }) 
            } else {
                const { keys,cert } = this.getKeysAndCert()
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
                // self-signed 私钥签名
                cert.sign(keys.privateKey, forge.md.sha256.create())
                // write
                fs.writeFileSync(this.rootCACertPath, forge.pki.certificateToPem(cert))
                fs.writeFileSync(this.rootCAKeyPath, forge.pki.privateKeyToPem(keys.privateKey))
                
                resolve({
                    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
                    publicKey: forge.pki.publicKeyToPem(keys.publicKey),
                    cert: forge.pki.certificateToPem(cert)
                })
            }
        })
    }
    isRootCAFilesExist () {
        return (fs.existsSync(this.rootCAKeyPath) && fs.existsSync(this.rootCACertPath))
    }
    isHostCAFilesExist (certPath, keyPath) {
        return (fs.existsSync(certPath) && fs.existsSync(keyPath))
    }
    clertCert () {
        const rootCAPath = this.rootCAPath
        if(fs.existsSync(rootCAPath)) {
            fs.readdirSync(rootCAPath).forEach((file, index) => {
                const curPath = path.join(rootCAPath, file)
                fs.unlinkSync(curPath)
            })
        }
    }
    getExtensionSAN (domain = '') {
        const isIp = /^\d+?\.\d+?\.\d+?\.\d+?$/.test(domain)
        if (isIp) {
            return {
                name: 'subjectAltName',
                altNames: [{ type: 7, ip: domain}]
            }
        } else {
            return {
                name: 'subjectAltName',
                altNames: [{ type: 2, value: domain}]
            }
        }
    }
}

module.exports = certCore