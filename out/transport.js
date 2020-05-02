"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//import '@types/node';
var worker_threads_1 = require("worker_threads");
var PlayState;
(function (PlayState) {
    PlayState[PlayState["STOPPED"] = 0] = "STOPPED";
    PlayState[PlayState["PLAYING"] = 1] = "PLAYING";
    PlayState[PlayState["STARTING"] = 2] = "STARTING";
    PlayState[PlayState["RUNNING"] = 3] = "RUNNING";
    PlayState[PlayState["CLOSING"] = 4] = "CLOSING";
})(PlayState = exports.PlayState || (exports.PlayState = {}));
var Transporter = /** @class */ (function () {
    function Transporter() {
        var _this = this;
        //this.setPlayState(PlayState.STOPPED);
        this.playState = PlayState.STOPPED;
        this.modules = [];
        //Configure MidiClock
        this.worker = new worker_threads_1.Worker('./out/MIDIClock.js');
        this.worker.on('message', function (result) {
            //console.log("tick");
            _this.sync(result);
        });
    }
    Transporter.prototype.send = function (msg) {
        console.log("Sending MIDI-Message: ", msg);
    };
    Transporter.prototype.sync = function (time) {
        //send to all modules
        this.modules.forEach(function (e) {
            e.sync(time);
        });
    };
    Transporter.prototype.addModule = function (mod) {
        mod.applyId(this.modules.length);
        mod.addTransportReference(this);
        this.modules.push(mod);
    };
    Transporter.prototype.getModules = function () {
        return this.modules;
    };
    Transporter.prototype.startTransport = function () {
        this.setPlayState(PlayState.STARTING);
        try {
            this.getModules().forEach(function (e) {
                e.start();
            });
        }
        catch (e) {
            console.log(e);
            this.setPlayState(PlayState.STOPPED);
            return;
        }
        this.setPlayState(PlayState.PLAYING);
    };
    Transporter.prototype.getPlayState = function () {
        return this.playState;
    };
    Transporter.prototype.setPlayState = function (state) {
        this.playState = state;
    };
    return Transporter;
}());
exports.Transporter = Transporter;
var TransportModule = /** @class */ (function () {
    function TransportModule() {
        this.moduleId = -1;
        this.playStateModule = PlayState.STOPPED;
    }
    TransportModule.prototype.applyId = function (id) {
        this.moduleId = id;
    };
    TransportModule.prototype.addTransportReference = function (t) {
        this.transport = t;
    };
    TransportModule.prototype.sendMidiMessage = function (msg) {
        var _a;
        (_a = this.transport) === null || _a === void 0 ? void 0 : _a.send(msg);
    };
    /**
     * Gets called every tick.
     * @param  {number} time current timestamp
     */
    TransportModule.prototype.sync = function (time) { };
    TransportModule.prototype.start = function () {
        this.startModuleInstance();
        if (this.getPlayState() != PlayState.RUNNING) {
            throw new TransportStartException(this.getId());
        }
    };
    TransportModule.prototype.getPlayState = function () {
        return this.playStateModule;
    };
    TransportModule.prototype.getId = function () {
        return this.moduleId;
    };
    /**
     * This Function must set this.playStateModule to PlayState.RUNNING on success, otherwise, the prestart function will throw an error!
     */
    TransportModule.prototype.startModuleInstance = function () { };
    return TransportModule;
}());
exports.TransportModule = TransportModule;
var TransportStartException = /** @class */ (function (_super) {
    __extends(TransportStartException, _super);
    function TransportStartException(id) {
        return _super.call(this, "Module with id " + id + " failed to start") || this;
    }
    return TransportStartException;
}(Error));
//# sourceMappingURL=transport.js.map