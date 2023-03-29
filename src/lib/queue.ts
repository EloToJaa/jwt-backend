import mc, { PacketMeta } from "minecraft-protocol";
import PlayerListHeader from "../types/PlayerListHeader.js";

class Queue {
	proxyClient: mc.ServerClient | null;
	client: mc.Client | null;
	server: mc.Server | null;

	queuePlace: string | null;
	ETA: string | null;
	isInQueue: boolean;
	restartQueue: boolean;

	usernameOrEmail: string;
	nickname: string;
	port: number;

	constructor(
		usernameOrEmail: string,
		nickname: string,
		port: number = 25565
	) {
		this.proxyClient = null;
		this.client = null;
		this.server = null;

		this.queuePlace = null;
		this.ETA = null;
		this.isInQueue = false;
		this.restartQueue = false;

		this.usernameOrEmail = usernameOrEmail;
		this.nickname = nickname;
		this.port = port;
	}

	stop() {
		this.isInQueue = false;
		this.queuePlace = null;
		this.ETA = null;
		if (this.client) {
			this.client.end();
		}
		if (this.proxyClient) {
			this.proxyClient.end("Stopped the proxy.");
		}
		if (this.server) {
			this.server.close();
		}
	}

	start() {
		this.isInQueue = true;
		this.client = mc.createClient({
			host: "2b2t.org",
			port: this.port,
			username: this.usernameOrEmail,
			version: "1.12.2",
			auth: "microsoft",
		});

		let finishedQueue = false;
		this.client.on("packet", (data: any, meta: PacketMeta) => {
			if (this.proxyClient) {
				this.filterPacketAndSend(data, meta, this.proxyClient);
			}

			if (finishedQueue) return;

			if (meta.name === "chat") {
				const chatMessage = JSON.parse(data.message);

				if (
					!(
						chatMessage.text &&
						chatMessage.text === "Connecting to the server..."
					)
				)
					return;

				if (this.restartQueue && this.proxyClient == null) {
					stop();
					setTimeout(this.start, 100);
				} else {
					finishedQueue = true;
					this.queuePlace = "FINISHED";
					this.ETA = "NOW";

					console.log(
						`Place in queue: ${this.queuePlace} (${this.ETA})`
					);
				}
			}

			if (meta.name === "playerlist_header") {
				const headermessage: PlayerListHeader = JSON.parse(
					data.header as string
				);
				const newQueuePlace =
					headermessage.extra[4].extra![0].text.replace("\n", "");
				const newETA = headermessage.extra[5].extra![0].text.replace(
					"\n",
					""
				);

				if (this.queuePlace !== newQueuePlace || this.ETA !== newETA) {
					if (this.server) {
						this.server.motd = `Place in queue: ${newQueuePlace}`;
					}
					console.log(`Place in queue: ${newQueuePlace} (${newETA})`);
				}
				this.ETA = newETA;
				this.queuePlace = newQueuePlace;
			}
		});

		this.client.on("end", () => {
			if (this.proxyClient) {
				this.proxyClient.end(
					"Connection reset by 2b2t server.\nReconnecting..."
				);
				this.proxyClient = null;
			}
			stop();
		});

		this.client.on("error", (err) => {
			if (this.proxyClient) {
				this.proxyClient.end(
					`Connection error by 2b2t server.\n Error message: ${err}\nReconnecting...`
				);
				this.proxyClient = null;
			}
			console.log("err", err);
			stop();
		});

		this.server = mc.createServer({
			"online-mode": false,
			host: "0.0.0.0",
			port: 25565,
			version: "1.12.2",
			maxPlayers: 1,
		});

		this.server.on("login", (newProxyClient: mc.ServerClient) => {
			if (newProxyClient.username !== this.nickname) {
				newProxyClient.end(
					`Username ${this.nickname} is not on the whitelist`
				);
				this.proxyClient = null;
				stop();
				return;
			}

			newProxyClient.write("login", {
				entityId: newProxyClient.id,
				levelType: "default",
				gameMode: 0,
				dimension: 0,
				difficulty: 2,
				maxPlayers: this.server ? this.server.maxPlayers : 1,
				reducedDebugInfo: false,
			});
			newProxyClient.write("position", {
				x: 0,
				y: 1.62,
				z: 0,
				yaw: 0,
				pitch: 0,
				flags: 0x00,
			});

			newProxyClient.on("packet", (data, meta) => {
				this.filterPacketAndSend(
					data,
					meta,
					this.client as mc.ServerClient
				);
			});

			this.proxyClient = newProxyClient;
		});
	}

	filterPacketAndSend(data: any, meta: PacketMeta, dest: mc.ServerClient) {
		if (meta.name !== "keep_alive" && meta.name !== "update_time") {
			dest.write(meta.name, data);
		}
	}
}

export default Queue;
