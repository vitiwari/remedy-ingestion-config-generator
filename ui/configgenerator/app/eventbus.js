function EventBus() {
    this.subscribers = [];
    this.subscribe = function (eventname, callback) {
        var subscriber = {
            "callback": callback
        };
        if (!this.subscribers[eventname]) {
            this.subscribers[eventname] = [];
            this.subscribers[eventname].push(subscriber);
        } else {
            this.subscribers[eventname].push(subscriber);
        }
    };

    this.publish = function (eventname, data) {
        var subscriberList = this.subscribers[eventname];
        if (subscriberList) {
            subscriberList.forEach(subscriber => {
                subscriber.callback(data);
            });
        }
    }
}