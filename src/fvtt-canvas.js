import { promises } from "fs-extra"

(async () => {

    async function isCanvasReady() {
		return new Promise(resolve => {
			Hooks.once('canvasReady', resolve);
		});
	}

    class Net {

		constructor() {
			game.socket.on(Net.SOCKET_NAME, (data) => {
				if (canvas.scene._id !== data.sceneId) {
					return;
				}

				this._runMessageCallbacks(data.message, data.msgData);
			});
		}

		_messageCallbacks(message) {
			const prop = `_funcs${message}`;
			if (!this[prop]) {
				this[prop] = [];
			}
			return this[prop];
		}

		_runMessageCallbacks(message, msgData) {
			this._messageCallbacks(message).forEach(func => func(msgData));
		}

		on(message, func) {
			this._messageCallbacks(message.name).push(func);
		}

		sendMessage(message, msgData) {
			message.dataProperties.forEach(prop => {
				if (!msgData.hasOwnProperty(prop)) {
					throw new Error(`Missing data for message "${message.name}": ${prop}`);
				}
			});
			Net._emit({
				message: message.name,
				sceneId: canvas.scene._id,
				msgData
			});
		}

		static get SOCKET_NAME() {
			return 'module.fvtt-canvas';
		}

		static get MESSAGES() {
			const defaultMsgProperties = [
				'id'
			];
			return {
				PAN_CANVAS: {
					name: 'PanCanvas',
					dataProperties: [
                        'position',
						...defaultMsgProperties
					]
				}
			};
		}

		static _emit(...args) {
			game.socket.emit(Net.SOCKET_NAME, ...args)
		}
    }

    class PanCanvasAPI {
		constructor(net) {
			this._net = net;
		}

        send(position, userId = game.user._id) {
			throwOnUserMissing(userId);
			throwErrorNoNumber(position.x, `position.x`);
			throwErrorNoNumber(position.y, `position.y`);
			this._net.sendMessage(Net.MESSAGES.PAN_CANVAS, {
				id: userId,
				position
			});
			return userId;
		}


    }
    
	function addNetworkBehavior(net) {
		net.on(Net.MESSAGES.PAN_CANVAS, ({id, position}) => {
            console.log("Would pan the canvas to position " + position[x])
		});
	}

    window.Grimble = window.Grimble || {};
    const net = new Net();
    addNetworkBehavior(net);

    window.Grimble.PanCanvas = new PanCanvasAPI(net);

})