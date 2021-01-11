require('dotenv').config()
import {app, bootstrap} from './app'
import {AddressInfo} from 'net'
import RequiredEnv from './utils/RequiredEnv';

RequiredEnv()
.then(() => bootstrap())
.then((r) => {
    const server = app.listen(parseInt(process.env.PORT || '5000') || 5000, '0.0.0.0', () => {
        const {port, address} = server.address() as AddressInfo;
        console.log('Server listening on:','http://' + address + ':'+port);
    });
})
.catch((err) => {
    console.log(err.message)
    process.exit(0);
})