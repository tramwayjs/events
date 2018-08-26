Tramway Events is a publisher-subscriber system that can be used to manage events with the Tramway core. It includes:

1. A Broker to handle the communications and choose an Emitter, each topic can have a different Broker with different configurations.
2. A Dispatcher class to be able to send Events.
3. A Subscriber class to leverage dependency injection and decouple logic.
4. A default Event Emitter using the one built into Node but with a simple interface such that it can be replaced with other systems if needed.

# Installation:
1. `npm install --save tramway-core-events`

# Some Practical Uses
- Handling hooks (or notifications) or logic flow before and after persisting with a Provider or some other operation.
- Injecting `tramway-core-validation` as a pre-persist condition to ensure data is validated before saved to your connection.
- Updating related Entities after persisting

# Getting Started

With dependency injection you can add the following entries to your services config files.

In this example, we set up everything that's needed for managing events in the `src/config/services/events.js` file and add the necessary mappings to the parameters in `src/config/parameters/global`.

> Note that in this example we use default as the name of the topic and for each topic there will be a corresponding DI configuration.

```javascript
import Broker, {Emitter, Dispatcher} from 'tramway-core-events';

export default {
    "broker.events:default": {
        "class": Broker,
        "constructor": [
            {"type": "service", "key": "emitter.node"},
            {"type": "parameter", "key": "topic_default"},
        ],
    },
    "emitter.node": {
        "class": Emitter,
    },
    "dispatcher.default": {
        "class": Dispatcher,
        "constructor": [
            {"type": "service", "key": "broker.events:default"},
        ],
    },
};
```

Then add a `events.js` file under `src/config/parameters/global`:

> All of your topic parameters for the various brokers will be assigned here. In this case, we just assign default.

```javascript
export default {
    "topic_default": 'default',
};

```

Then in the `index.js` under `src/config/parameters/global`:

```javascript
import app from './app';
import cors from './cors';
import port from './port';
import routes from './routes';
import events from './events;

export default {
    app,
    cors,
    port,
    routes,
    ...events,
}
```

## Creating your first Subscriber

Add a new directory `src/subscribers` and create a subscriber for each topic, in this example we will call it `DefaultSubscriber` to correspond with the `default` topic.

```javascript
import {Subscriber} from 'tramway-core-events';

export default class DefaultSubscriber extends Subscriber {
    constructor(someService, someFactory) {
        super();
        this.someService = someService;
        this.someFactory = someFactory;
    }

    // Arguments here will be placed in the order they were passed to emit. In this case, we always pass the event first.
    execute(event) {
        let item = this.someFactory.create(event.someData);
        this.someService.doSomething(item);
    }
}
```

Then we can add the subscriber to the dependency injection configuration to leverage the service and factory we used.

Add a new file `src/config/services/subscribers.js`

```javascript
import {
    DefaultSubscriber,
} from '../../subscribers';

export default {
    "subscriber.default": {
        "class": DefaultSubscriber,
        "constructor": [
            {"type": "service", "key": "service.some"},
            {"type": "service", "key": "factory.some"},
        ],
        "functions": []
    },
};
```

Make sure `src/config/services/index.js` acknowledges the subscribers:

```javascript
import router from './router';
import logger from './logger';
import core from './core';
import controllers from './controllers';
import events from './events';
import subscribers from './subscribers';

export default {
    ...router,
    ...logger,
    ...core,
    ...controllers,
    ...events,
    ...subscribers,
}
```

And register the Handler with your Broker in `src/config/services/events.js`:

You have the choice of adding a normal handler `addHandler` which will make a call every time the event is fired or only executing once `addOnce` which will ignore all subsequent events once the first event was dispatched.

```javascript
"broker.events:default": {
    "class": Broker,
    "constructor": [
        {"type": "service", "key": "emitter.node"},
        {"type": "parameter", "key": "topic_default"},
    ],
    "functions": [
        {
            "function": "addHandler",
            "args": [
                {"type": "service", "key": "subscriber.default"},
            ]
        }
    ]
},
```

### Creating Handlers
Internally, a `Subscriber` is a `Handler` which passes its `execute` method as a listener to the `Emitter`. If you want to use an alternative architecture to pub-sub you can extend the `Handler` class and implement whatever alternative abstraction you need.

## Creating Custom Events
You can create custom events to facilitate data and logic flow through the pub-sub system. The aim of custom events would be to add some extra fields or logic relating to them that are decoupled from the system itself. Refrain from injecting services into events since the Subscriber or Handler can manage services for you with the DI container.

In a new directory `src/events`, add your custom event.

```javascript
import {Event} from 'tramway-core-events';

export default CustomEvent extends Event {
    customMethod(params) {
        return typeof params; //some logic based on the information in the event.
    }
}
```

## Dispatching your first Event
In your application you can inject the dispatcher dependency and use it to dispatch events when needed.

```javascript
this.dispatcher.dispatch(new CustomEvent());
```

It uses the Broker to send the event to the correct topic so a subscriber can act on it.

## Creating Custom Emitters
The separation of the `Broker` and `Emitter` lets you change event emitters based on the needs of your project. Perhaps you need a simple in-memory system like the one provided by Node, or you need persistence or other features from Redis pub/sub or Google Cloud.

In a new directory `src/emitters`, add your custom emitter by implementing the stubs:

```javascript
import {Emitter} from 'tramway-core-events';

export default class CustomEmitter extends Emitter {
    //Here you can add any configuration via Dependency Injection
    constructor(params) {
        super();
        this.params = params;
    }

    /**
     * 
     * @param {string} topic 
     * @param {Handler} handler 
     * @returns {Emitter}
     */
    on(topic, handler) {
        
    }

    /**
     * 
     * @param {string} topic 
     * @param {Handler} handler 
     * @returns {Emitter}
     */
    once(topic, handler) {
       
    }

    /**
     * 
     * @param {string} topic 
     * @param {args} args[] 
     * @returns {Emitter}
     */
    emit(topic, ...args) {
        
    }
}
```