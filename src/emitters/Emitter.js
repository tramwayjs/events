import EventEmitter from 'events';

export default class Emitter {
    emitter = new EventEmitter();

    /**
     * 
     * @param {string} topic 
     * @param {Handler} handler 
     * @returns {Emitter}
     */
    on(topic, handler) {
        this.emitter.on(topic, (...args) => handler.execute(...args));
        return this;
    }

    /**
     * 
     * @param {string} topic 
     * @param {Handler} handler 
     * @returns {Emitter}
     */
    once(topic, handler) {
        this.emitter.once(topic, (...args) => handler.execute(...args));
        return this;
    }

    /**
     * 
     * @param {string} topic 
     * @param {args} args[] 
     * @returns {Emitter}
     */
    emit(topic, ...args) {
        this.emitter.emit(topic, ...args);
        return this;
    }
}