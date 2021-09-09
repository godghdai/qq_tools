const { isFunction } = require('./util/types');
function executorService(maxOccurs, WorkerFactory) {
    if (!(this instanceof executorService))
        return new executorService(maxOccurs);

    if (!WorkerFactory)
        throw new Error("The parameter 'WorkerFactory' is not allowed to be null ");

    if (!isFunction(WorkerFactory))
        throw new Error("The parameter 'WorkerFactory' must be a function ");

    this.maxOccurs = maxOccurs || 5;
    this.workers = [];
    this.tasks = [];
    this.WorkerFactory = WorkerFactory;
    this.init();
}
executorService.prototype.run = function () {
    if (this.tasks.length > 0 && this.workers.length > 0) {
        this.workers.pop().run(this.tasks.pop());
    }
}

executorService.prototype.onDone = function (worker) {
    this.workers.push(worker);
    this.run();
}

executorService.prototype.init = function () {
    var WorkerFactory = this.WorkerFactory;
    for (let i = 0; i < this.maxOccurs; i++) {
        var worker =new WorkerFactory(this.onDone.bind(this));
        this.workers.push(worker);
    }
}
executorService.prototype.submit = function (task) {
    this.tasks.push(task);
    this.run();
}
module.exports = executorService
