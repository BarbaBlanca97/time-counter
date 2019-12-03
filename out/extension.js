"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS["elapsedTime"] = "elapsed_time";
})(STORAGE_KEYS || (STORAGE_KEYS = {}));
let storage;
let elapsedTime = 0;
let sessionStartTime = 0;
let totalPausedTime = 0;
let pauseStartTime = 0;
let updater;
let paused = false;
const updateElapsed = function () {
    if (!paused) {
        storage.update('elapsed_time', (elapsedTime - totalPausedTime) + Date.now() - sessionStartTime);
    }
};
const sessionTime = function () {
    return Date.now() - (sessionStartTime + totalPausedTime + (paused ? Date.now() - pauseStartTime : 0));
};
const pause = function () {
    if (!paused) {
        pauseStartTime = Date.now();
        paused = true;
    }
};
const resume = function () {
    if (paused) {
        totalPausedTime += Date.now() - pauseStartTime;
        paused = false;
    }
};
const msToHour = function (time) {
    let result = '';
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    if (hours > 0) {
        result += `${hours}h `;
    }
    result += `${minutes}m`;
    return result;
};
function activate(context) {
    storage = context.workspaceState;
    elapsedTime = storage.get(STORAGE_KEYS.elapsedTime) || 0;
    sessionStartTime = Date.now();
    const sessionTimeDisposable = vscode.commands.registerCommand('extension.showSessionTime', () => {
        vscode.window.showInformationMessage(`${msToHour(sessionTime())} en esta sesion`);
    });
    const totalTimeDisposable = vscode.commands.registerCommand('extension.showTotalTime', () => {
        vscode.window.showInformationMessage(`${msToHour(elapsedTime + sessionTime())} en total`);
    });
    const pauseTimeDisposable = vscode.commands.registerCommand('extension.pauseTime', pause);
    const resumeTimeDisposable = vscode.commands.registerCommand('extension.resumeTime', resume);
    context.subscriptions.push(sessionTimeDisposable, totalTimeDisposable, pauseTimeDisposable, resumeTimeDisposable);
    updater = setInterval(updateElapsed, 60000);
}
exports.activate = activate;
function deactivate() {
    updateElapsed();
    clearInterval(updater);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map