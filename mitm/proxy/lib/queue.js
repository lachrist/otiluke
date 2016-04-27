
function queue () { this.queue.push(arguments) }
function purge (f) { this.queue.forEach(f.apply.bind(f,null)) }
module.exports = function () { return {queue:[], tunnel:queue, purge:purge} }
