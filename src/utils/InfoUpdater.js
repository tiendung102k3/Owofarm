/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const request = require('request');
const { SHARDER_HOST, SHARDER_PASS, SHARDER_SERVER } = process.env;
const interval = 300000;

class InfoUpdater {
	constructor(main) {
		this.main = main;
		this.totalShards = false;
		if (!main.debug) {
			setInterval(() => { 
				this.updateBotInfo(); 
			}, interval);
			setInterval(() => { 
				this.updateDBLInfo(); 
			}, 3200000);
			this.updateBotInfo();
		}
	}

	updateBotInfo() {
		let info = {
			password: SHARDER_PASS,
			guilds: this.main.bot.guilds.size,
			channels: 0,
			users: this.main.bot.users.size
		};
		request({
			method: 'POST',
			uri: `${SHARDER_HOST}/update-bot/${SHARDER_SERVER}-${this.main.clusterID}`,
			json: true,
			body: info,
		}, (err, res) => {
			if (err) {
				console.error(err);
				throw err;
			}
			let guilds = res.body.guilds;
			guilds = this.main.global.toFancyNum(guilds);
			// this.main.bot.editStatus(null, { name: guilds + ' servers!', type: 3 });
			this.main.bot.editStatus(null, {
				name: ` with ${guilds} servers!`,
				type: 1,
				url: "https://www.twitch.tv/owobotplays"
			});
		});
	}

	async updateDBLInfo() {
		if (!this.totalShards) {
			this.totalShards = await this.main.global.getTotalShardCount();
		}
		let guildSize = Math.floor(this.main.bot.guilds.size / this.main.bot.shards.size);
		this.main.bot.shards.forEach((val) => {
			this.main.dbl.postStats(guildSize, val.id, this.totalShards);
		});
	}
};

module.exports = InfoUpdater;
