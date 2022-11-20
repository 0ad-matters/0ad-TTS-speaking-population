var AudioTTSspeak = new Map();


class BoonGUIStatsTopPanel {

	constructor() {
		const PREFIX = "StatsTopPanel";
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.headerContainer = Engine.GetGUIObjectByName(`${PREFIX}Header`);
		this.rowsContainer = Engine.GetGUIObjectByName(`${PREFIX}Rows`);
		this.rows = this.rowsContainer.children.map((row, index) => new BoonGUIStatsTopPanelRow(row, index));
		this.headerContainer.size = "0 0 100% 26";
		this.rowsContainer.size = "0 26 100% 100%";
		this.scales = new BoonGUIColorScales();
		this.root.sprite = "prettyBackgroundColor";
		this.TTY = {};
		this.TTY.POPlast = {"food":0, "wood":0, "stone":0, "metal":0, "foodwood":0.0};

		this.itsMe;
		this.playername_multiplayer = Engine.ConfigDB_GetValue("user", "playername.multiplayer");
		this.playername_singleplayer = Engine.ConfigDB_GetValue("user", "playername.singleplayer");

	}

	update(playersStates) {
		this.root.hidden = false;
		this.scales.reset();

		// const playerNick = setStringTags(playersStates.nick, { "color": playersStates.playerColor });
		// warn('playerNick = ' + JSON.stringify(playerNick));
		// let playerNickShort = '';
		// if (playerNick)
		// 	try {
		// 		playerNickShort = playerNick.match(/.*\](\w+)\[/)[1];
		// 	} catch (error) {
		// 		return
		// 	 }
		// warn(JSON.stringify(playersStates[0].name));
		// warn(JSON.stringify(this.playername_singleplayer));



		// tells only if i playing in the game. false if i observer. always in row 1
		this.itsMe = (playersStates[0].name == this.playername_multiplayer || playersStates[0].name == this.playername_singleplayer);



		// warn('this.itsMe = ' + this.itsMe);
		// warn('itsMeGlobal = ' + itsMeGlobal); // always false
		// warn(JSON.stringify(playersStates));
		// warn(JSON.stringify(playersStates[0].name));
		// warn(JSON.stringify(playersStates[1].name));

		playersStates.forEach(state => {
			this.scales.addValue("popCount", state.popCount);
			this.scales.addValue("popLimit", state.popLimit);

			this.scales.addValue("economyTechsCount", state.economyTechsCount);
			this.scales.addValue("militaryTechsCount", state.militaryTechsCount);

			this.scales.addValue("femaleCitizen", state.classCounts.FemaleCitizen ?? 0);
			this.scales.addValue("infantry", state.classCounts.Infantry ?? 0);
			this.scales.addValue("cavalry", state.classCounts.Cavalry ?? 0);

			this.scales.addValue("enemyUnitsKilledTotal", state.enemyUnitsKilledTotal);
			this.scales.addValue("unitsLostTotal", state.unitsLostTotal);
			this.scales.addValue("killDeathRatio", state.killDeathRatio);

			for (const resType of g_BoonGUIResTypes)
			{
				this.scales.addValue(`${resType}Counts`, state.resourceCounts[resType]);
				this.scales.addValue(`${resType}Gatherers`, state.resourceGatherers[resType]);
				this.scales.addValue(`${resType}Rates`, state.resourceRates[resType]);

				// warn(JSON.stringify(state));
				// warn(JSON.stringify(state.index));

				if((this.itsMe && state.index == 1) // host is always in first row  means index is 1 here. btw. as observer you maybe not host, so maybe not in first row. in single games you always in first row (if you playing)
				&& Engine.ConfigDB_GetValue("user", "boongui.TTStipsFromPopulation") == "true") {

					// warn("state.popCount=" + state.popCount);

					if(state.popCount < 150){
						let wf = 0;
						let fw = 0;

						if(state.resourceCounts['wood'] && state.resourceCounts['food']){
							wf = Math.round(( state.resourceCounts['wood'] / state.resourceCounts['food'] )*10)/10;
							fw = Math.round(( state.resourceCounts['food'] / state.resourceCounts['wood'] )*10)/10;
						}
						if( wf != this.TTY.POPlast['foodwood'] ){
							// && ( wf > 1.6 || fw > 1.6 )){ //  1.
							// warn('wf=' + wf);
							// warn('fw=' + fw);
							let msg = '';
							if ( wf > 1.8 )
								msg = "Not balanced. More food to eat please.", "config/user.cfg";
							else if ( fw > 1.8 )
								msg = "Not balanced. More wood please. fell trees", "config/user.cfg";

							if(msg){
								ttsPL(msg);
								this.TTY.POPlast['foodwood'] = wf;
							}
						}
					}

					if( resType == 'food'  
						&& this.TTY.POPlast[resType] != state.resourceCounts[resType] ){ 			
							let msg =  '';
							if(state.resourceCounts[resType] <= 1 * state.popCount)
								msg = "We are terrible hungry.";
							// else if(state.resourceCounts[resType] <= 7 * state.popCount)
							// 	msg = "We are hungry.";
							// else if(state.resourceCounts[resType] <= 10 * state.popCount)
							// 	msg = "Our food supplies are low.";
							if(msg){
								ttsPL(msg);
								this.TTY.POPlast[resType] = state.resourceCounts[resType];
							}
					}else
					if( resType == 'wood'  
					&& this.TTY.POPlast[resType] != state.resourceCounts[resType] ){ 			
						let msg =  '';
						if(state.resourceCounts[resType] <= 1 * state.popCount)
							msg =  resType + " is terrible low.";
						// else if(state.resourceCounts[resType] < 7 * state.popCount)
						// 	msg = "A little more " + resType + " would be good.";
						// else if(state.resourceCounts[resType] <= 10 * state.popCount)
						// 	msg = "Our " + resType + " supplies are low.";
						if(msg){
							ttsPL(msg);
							this.TTY.POPlast[resType] = state.resourceCounts[resType];
							
						}
					}else
					if( resType == 'stone'  
					&& this.TTY.POPlast[resType] != state.resourceCounts[resType] ){ 			
						let msg =  '';
						if(state.resourceCounts[resType] <= 2 * state.popCount)
							msg = resType + " is terrible low.";
						// else if(state.resourceCounts[resType] < 10 * state.popCount)
						// 	msg = "A little more " + resType + " would be good.";
						if(msg){
							ttsPL(msg);
							this.TTY.POPlast[resType] = state.resourceCounts[resType];
							
						}
					}


				}
			}
		});
		this.rows.forEach((row, i) => row.update(playersStates[i], this.scales));
	}
}
function ttsPL(msg){
	const date = new Date();
	const msgWithoutNumber = msg.replace(/\d+/g,''); // it often good enough to remember only if the type change. 
	const msgDateInMap = AudioTTSspeak.get(msgWithoutNumber) // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map?retiredLocale=de
	// undefined
	// if(msgDateInMap === undefined)
	let doSpeak = false;
	if (!msgDateInMap) {
		// warn("AudioTTSspeak.set");
		doSpeak = true;
	}else{
		const diffSeconds = Math.abs(date - msgDateInMap) / 1000;
		// warn("diffSeconds=" + diffSeconds);

		if(diffSeconds > 15){ // dont remind if last reminder was before 10 seconds
			doSpeak = true;
		}

	}

	if(doSpeak){
		Engine.ConfigDB_WriteValueToFile("user", "AudioTTS.speak", msg, "config/user.cfg");
		const isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
		Engine.ConfigDB_WriteValueToFile("user", "AudioTTS.timestamp","" + isoDateTime, "config/user.cfg");
		AudioTTSspeak.set(msgWithoutNumber, date);
	}

}

