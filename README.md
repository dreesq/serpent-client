<p align="center"> 
  <img src="https://user-images.githubusercontent.com/7228512/68618432-f72fc380-04d1-11ea-85af-5565c37ea947.png" width="190">
</p>

Client component of the Serpent ecosystem. You may read more in our [documentation](https://dreesq.github.io/serpent/#/client/introduction).

# Setup

```
npm install @dreesq/serpent-client
```

#### Separate dependencies
These dependencies are passed in client constructor
```
npm i axios socket.io-client
```

# Usage

Basic client instantiation

```js
import Serpent from '@dreesq/serpent-client'
import axios from 'axios';

const client = new Serpent({
    debug: true,
    axios,
    handler: 'https://localhost:3000/o',
    actions: 'https://localhost:3000/o'
});

await client.setup();

// Assuming there's an action defined with {name: 'hello'}
const {data, errors} = await client.hello({
    name: 'World'
});
```
