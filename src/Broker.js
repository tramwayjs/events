export default class Broker {
    /**
     * 
     * @param {Emitter} emitter 
     * @param {string} topic 
     */
    constructor(emitter, topic) {
        this.emitter = emitter;
        this.topic = topic;
    }

    /**
     * 
     * @param {Event} event 
     * @returns {Broker}
     */
    emit(event) {
        let topic = this.topic || event.getTopic();

        this.emitter.emit(topic, event);
        return this;
    }

    /**
     * 
     * @param {Handler} handler 
     * @returns {Broker}
     */
    addHandler(handler) {
        this.emitter.on(this.topic, handler);
        return this;
    }

    /**
     * 
     * @param {Handler} handler 
     * @returns {Broker}
     */
    addOnce(handler) {
        this.emitter.once(this.topic, handler);
        return this;
    }
}