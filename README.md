# node-cert-generator
Generate self-signed certs with Promise.

## Options

```javascript
const CertGenerator = require('node-cert-generator')
const options = {
    keyPair: 2048,
    rootPath: '' // default to ./node_modules/node-cert-generator/cert
}
const certGenerator  = new CertGenerator (options)
```

## Usage

```javascript

const certGenerator  = new CertGenerator (options)

certGenerator.getRootCA().then(rootCA => {
    // do something...
})

certGenerator.getHostCAKey(host).then(hostKey => {
    // do something...
})
```

## Methods

### getRootCA

no params, return with object
```
{
    cert,
    publicKey,
    privateKey
}
```

### getRootCAKey

no params, return with root publicKey.

### getRootCACert

no params, return with root Cert.

### getHostCAKey

params: `hostName: String`, return with host privateKey.

### getHostCACert

params: `hostName: String`, return with host Cert.
