# node-cert
Generate self-signed certs with Promise.

## Options

```javascript
const options = {
    keyPair: 2048,
    rootPath: ''
}
const cert = new Cert(options)
```

## Usage

```javascript

const cert = new Cert(options)

cert.getRootCA().then(rootCA => {
    // do something...
})

cert.getHostCAKey(host).then(hostKey => {
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
