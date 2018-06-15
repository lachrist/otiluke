
module.exports = (location, emitter) => function (error) { emitter.emit("error", error, location, this) };
