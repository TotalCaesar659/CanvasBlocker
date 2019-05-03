/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function(){
	"use strict";
	
	const extension = require("../lib/extension");
	const settings = require("../lib/settings");
	const settingContainers = require("../lib/settingContainers");
	require("../lib/theme").init();
	const searchParameters = new URLSearchParams(window.location.search);
	
	
	var title = document.createElement("h1");
	title.className = "title";
	title.textContent = extension.getTranslation("whitelist_inspection_title");
	document.body.appendChild(title);
	
	document.querySelector("head title").textContent = title.textContent;
	
	settings.onloaded(function(){
		const sets = settingContainers.urlContainer.get();
		
		const setSelect = document.createElement("select");
		sets.forEach(function(set){
			setSelect.appendChild(new Option(set.url));
		});
		document.body.appendChild(setSelect);
		
		if (searchParameters.has("urls")){
			const urls = JSON.parse(searchParameters.get("urls")).map(function(url){
				return new URL(url);
			});
			if (
				!sets.some(function(set, index){
					if (urls.some(function(url){
						return set.match && set.match(url);
					})){
						setSelect.selectedIndex = index;
						return true;
					}
				}) &&
				searchParameters.has("domain")
			){
				setSelect.appendChild(new Option(searchParameters.get("domain")));
				setSelect.selectedIndex = setSelect.options.length - 1;
			}
		}
		
		const whitelistSettings = [
			{
				title: extension.getTranslation("whitelist_all_apis"),
				name: "blockMode",
				whitelistValue: "allow",
				protectedValue: "fake"
			},
			{
				title: extension.getTranslation("section_canvas-api"),
				name: "protectedCanvasPart",
				whitelistValue: "nothing",
				protectedValue: "readout"
			},
			{
				title: extension.getTranslation("section_audio-api"),
				name: "protectAudio",
				whitelistValue: false,
				protectedValue: true
			},
			{
				title: extension.getTranslation("section_history-api"),
				name: "historyLengthThreshold",
				whitelistValue: 10000,
				protectedValue: 2
			},
			{
				title: extension.getTranslation("section_window-api"),
				name: "protectWindow",
				whitelistValue: false,
				protectedValue: true
			},
			{
				title: extension.getTranslation("section_DOMRect-api"),
				name: "protectDOMRect",
				whitelistValue: false,
				protectedValue: true
			},
			{
				title: extension.getTranslation("section_navigator-api"),
				name: "protectNavigator",
				whitelistValue: false,
				protectedValue: true
			},
		];
		
		const table = document.createElement("table");
		whitelistSettings.forEach(function(setting){
			const row = document.createElement("tr");
			setting.row = row;
			const name = document.createElement("td");
			name.textContent = setting.title || extension.getTranslation(setting.name + "_title");
			row.appendChild(name);
			setting.input = document.createElement("input");
			setting.input.type = "checkbox";
			setting.input.addEventListener("change", function(){
				settings.set(
					setting.name,
					this.checked? setting.protectedValue: setting.whitelistValue,
					setSelect.value
				);
			});
			const input = document.createElement("td");
			input.appendChild(setting.input);
			row.appendChild(input);
			table.appendChild(row);
		});
		document.body.appendChild(table);
		
		function update(){
			whitelistSettings.forEach(function(setting){
				setting.row.style.display = settings.get(setting.name) === setting.whitelistValue?
					"none":
					"";
				
				const currentValue = settings.get(setting.name, setSelect.value);
				setting.input.checked = currentValue !== setting.whitelistValue;
			});
		}
		update();
		setSelect.addEventListener("change", update);
		settings.on("any", update);
	});
}());