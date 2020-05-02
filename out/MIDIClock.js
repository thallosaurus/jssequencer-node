"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
function returnClock() {
    return Date.now();
}
while (true) {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(returnClock());
}
//# sourceMappingURL=MIDIClock.js.map