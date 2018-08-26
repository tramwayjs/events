export default class Dispatcher {
    constructor(broker) {
        this.broker = broker;
    }

    /**
     * 
     * @param {Event} event 
     * @returns {Dispatcher}
     */
    dispatch(event) {
        this.broker.emit(event);
        return this;
    }
}