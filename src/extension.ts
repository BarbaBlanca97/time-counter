import * as vscode from 'vscode';

enum STORAGE_KEYS {
	elapsedTime = 'elapsed_time'
}

let storage: 			vscode.Memento;
let elapsedTime: 		number = 0;
let sessionStartTime: 	number = 0;
let totalPausedTime:	number = 0;
let pauseStartTime: 	number = 0;
let updater: 			NodeJS.Timeout;

let paused: boolean = false;

const updateElapsed = function (): void {
	if (!paused) { storage.update('elapsed_time', ( elapsedTime - totalPausedTime ) + Date.now() - sessionStartTime); }
};

const sessionTime = function (): number {
	return Date.now() - ( sessionStartTime + totalPausedTime + ( paused ? Date.now() - pauseStartTime : 0 ));
};

const pause = function (): void {
	if (!paused) {
		pauseStartTime = Date.now();
		paused = true;
	}
};

const resume = function (): void {
	if (paused) {
		totalPausedTime += Date.now() - pauseStartTime;
		paused = false;
	}
};

const msToHour = function (time: number): string {
	let result 		= '';
	const hours 	= Math.floor(time / 3600000);
	const minutes 	= Math.floor((time % 3600000) / 60000);

	if (hours > 0) { result += `${ hours }h `; }
	result += `${ minutes }m`;

	return result;
};

export function activate(context: vscode.ExtensionContext) {
	storage				= context.workspaceState;
	elapsedTime 		= storage.get(STORAGE_KEYS.elapsedTime) || 0;
	sessionStartTime 	= Date.now();

	const sessionTimeDisposable = vscode.commands.registerCommand('extension.showSessionTime', () => {
		vscode.window.showInformationMessage(`${ msToHour(sessionTime()) } en esta sesion`);
	});

	const totalTimeDisposable = vscode.commands.registerCommand('extension.showTotalTime', () => {
		vscode.window.showInformationMessage(`${ msToHour(elapsedTime + sessionTime()) } en total`);
	});

	const pauseTimeDisposable = vscode.commands.registerCommand('extension.pauseTime', pause);

	const resumeTimeDisposable = vscode.commands.registerCommand('extension.resumeTime', resume);

	context.subscriptions.push(sessionTimeDisposable, totalTimeDisposable, pauseTimeDisposable, resumeTimeDisposable);

	updater = setInterval(updateElapsed, 60000);
}

export function deactivate() {
	updateElapsed();
	clearInterval(updater);
}
