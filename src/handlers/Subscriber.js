import Handler from './Handler';

export default class Subscriber extends Handler {
    constructor(topic) {
        super();
        this.topic = topic;
    }

    execute(...args) {
        throw new Error('Expects an implementation of Handler')
    }
}