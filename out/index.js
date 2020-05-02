"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transport_1 = require("./transport");
var Main = /** @class */ (function () {
    function Main() {
        //init transport
        console.log("Hello World!");
        this.transport = new transport_1.Transporter();
        this.transport.send([0xFA]);
    }
    return Main;
}());
new Main();
//# sourceMappingURL=index.js.map