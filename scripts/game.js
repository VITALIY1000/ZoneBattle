"use strict";

let canvas, ctx, gameStarted, gamePaused;
let w, h, d, speed, frameUpdateInterval;
let players = [];
let reCalc = false;
const gameFrameMillis = 16;
main();

function main() {
	gameStarted = gamePaused = false;
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	frameUpdate();
	frameUpdateInterval = setTimeout(function update() {
		frameUpdate();
		frameUpdateInterval = setTimeout(update, gameFrameMillis);
	}, gameFrameMillis);
	document.body.onkeydown = onKeyDown;
}

function start() {
	ctx.fillStyle = "#00000000";
	ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
	document.getElementById("fixed-text").style.visibility = "hidden";
	gameStarted = true; gamePaused = false;
	for (let i = 0; i < players.length; i++) players[i].gObj.remove();
	players = [];

	players.push(new Player("#FF0000", "left-top", 1,
		{"up":"KeyW", "right":"KeyD", "down":"KeyS", "left":"KeyA", "paint":"KeyQ"}));
	players.push(new Player("#0000FF", "right-bottom", 3,
		{"up":"ArrowUp", "right":"ArrowRight", "down":"ArrowDown", "left":"ArrowLeft", "paint":"KeyM"}));

	for (let i = 0; i < players.length; i++) playerToResp(i);
}

function resume() {
	gamePaused = !gamePaused;
}

function pause() {
	gamePaused = !gamePaused;
}

function paint(index) {
	let left = parseInt(players[index].gObj.style.left) - document.getElementsByClassName("info")[0].offsetWidth - 20;
	let top = parseInt(players[index].gObj.style.top) - 10;
	let playerW = players[index].gObj.offsetWidth;
	ctx.fillStyle = players[index].color;
	ctx.fillRect(left - 2 * playerW, top - 2 * playerW, 5 * playerW, 5 * playerW);
	reCalc = true;
}

function frameUpdate() {
	updateGameValues();

	if (gameStarted && !gamePaused) {
		if (reCalc) {
			reCalc = false;
			calculatePercentes();
		}

		for (let i = 0; i < players.length; i++) {
			if (players[i].direction == 0) 
				players[i].gObj.style.top = (parseInt(players[i].gObj.style.top) - speed) + "px";
			else if (players[i].direction == 1) 
				players[i].gObj.style.left = (parseInt(players[i].gObj.style.left) + speed) + "px";
			else if (players[i].direction == 2)
				players[i].gObj.style.top = (parseInt(players[i].gObj.style.top) + speed) + "px";
			else if (players[i].direction == 3)
				players[i].gObj.style.left = (parseInt(players[i].gObj.style.left) - speed) + "px";
			else
				alert("Error: variable 'direction' have invalid value");
		}
	}

	for (let i = 0; i < players.length; i++) {
		if (playerWentsIntoAnotherZone(i)) {
			playerToResp(i);
		}
	}
}

function playerWentsIntoAnotherZone(index) {
	let left = parseInt(players[index].gObj.style.left) - document.getElementsByClassName("info")[0].offsetWidth - 20;
	let top = parseInt(players[index].gObj.style.top) - 10;
	let playerW = Math.round(d / 30);
	let imageData = ctx.getImageData(left, top, playerW + 1, playerW + 1);
	let rgb = hexToRgb(players[index].color);

	function isBadPixel(r, g, b) {
		if (r == rgb.r && g == rgb.g && b == rgb.b) return false;
		if (r == 0 && g == 0 && b == 0) return false;

		return true;
	}

	for (let i = 0; i < playerW; i++) {
		for (let j = 0; j < speed; j++) {
			if(isBadPixel(
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 0],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 1],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 2])) return true;
		}

		for (let j = playerW; j > playerW - speed; j--) {
			if(isBadPixel(
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 0],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 1],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 2])) return true;
		}
	}

	for (let j = speed; j < playerW - speed; j++) {
		for (let i = 0; i < speed; i++) {
			if(isBadPixel(
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 0],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 1],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 2])) return true;
		}

		for (let i = playerW; i > playerW - speed; i--) {
			if(isBadPixel(
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 0],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 1],
				imageData.data[(j * (imageData.width * 4)) + (i * 4) + 2])) return true;
		}
	}

	return false;
}

function playerToResp(index) {
	let ph = document.getElementsByClassName("info")[0].offsetWidth;

	switch (players[index].resp) {
		case "top":
			players[index].gObj.style.left = ph + 20 + Math.round((d - d / 30) / 2) + "px";
			players[index].gObj.style.top = 10 + Math.round(d / 15) + "px";
			break;
		case "right":
			players[index].gObj.style.left = ph + 20 + d - Math.round(d / 10) + 1 + "px";
			players[index].gObj.style.top =  10 + Math.round((d - d / 30) / 2) + "px";
			break;
		case "bottom":
			players[index].gObj.style.left = ph + 20 + Math.round((d - d / 30) / 2) + "px";
			players[index].gObj.style.top = 10 + d - Math.round(d / 10) + 1 + "px";
			break;
		case "left":
			players[index].gObj.style.left = ph + 20 + Math.round(d / 15) + "px";
			players[index].gObj.style.top = 10 + Math.round((d - d / 30) / 2) + "px";
			break;
		case "left-top":
			players[index].gObj.style.left = ph + 20 + Math.round(d / 15) + "px";
			players[index].gObj.style.top = 10 + Math.round(d / 15) + "px";
			break;
		case "right-top":
			players[index].gObj.style.left = ph + 20 + d - Math.round(d / 10) + 1 + "px";
			players[index].gObj.style.top = 10 + Math.round(d / 15) + "px";
			break;
		case "right-bottom":
			players[index].gObj.style.left = ph + 20 + d - Math.round(d / 10) + 1 + "px";
			players[index].gObj.style.top = 10 + d - Math.round(d / 10) + 1 + "px";
			break;
		case "left-bottom":
			players[index].gObj.style.left = ph + 20 + Math.round(d / 15) + "px";
			players[index].gObj.style.top = 10 + d - Math.round(d / 10) + 1 + "px";
			break;
		default:
			alert("Error: respawn have invalid value");
	}
}

function updateGameValues() {
	invalidatePlayersPosition();

	if (window.innerWidth != w || window.innerHeight != h) {
		w = window.innerWidth;
		h = window.innerHeight;
		d = (w - 300 > h ? h : w - 300) - 20;
		speed = Math.round(d / 500 + 0.3);
		canvas.width = d;
		canvas.height = d;
		let array = document.querySelectorAll(".controller div button");
		let infoW = document.getElementsByClassName("info")[0];

		for (let i = 0; i < array.length; i++) {
			array[i].style.width = Math.round(infoW.offsetWidth / 10 * 3) + "px";
			array[i].style.height = Math.round(infoW.offsetWidth / 10 * 3) + "px";
			array[i].style.fontSize = Math.round(infoW.offsetWidth / 6) + "px";
		}

		let elems = document.querySelectorAll(".controller");
		elems[0].style.top = h - 20 - elems[0].offsetHeight + "px";
		elems[1].style.top = h - 20 - elems[1].offsetHeight + "px";
		elems[1].style.left = w - 20 - elems[1].offsetWidth + "px";


		if (gameStarted) start();    
	}

	for (let i = 0; i < players.length; i++) {
		players[i].gObj.style.border = Math.round(d / 240) + "px solid black";
		players[i].gObj.style.width = Math.round(d / 40) + "px";
		players[i].gObj.style.height = Math.round(d / 40) + "px";
	}
}

function invalidatePlayersPosition() {
	let ph = document.getElementsByClassName("info")[0].offsetWidth;

	for (let i = 0; i < players.length; i++) {
		let playerW = players[i].gObj.offsetWidth;

		if (parseInt(players[i].gObj.style.left) >= ph + d - playerW + 20) {
			players[i].gObj.style.left = ph + d - playerW + 20 + "px";
			if (players[i].direction == 1) players[i].direction = 3;
		} else if (parseInt(players[i].gObj.style.left) <= ph + 20) {
			players[i].gObj.style.left = ph + 20 + "px";
			if (players[i].direction == 3) players[i].direction = 1;
		}

		if (parseInt(players[i].gObj.style.top) >= d - playerW + 10) {
			players[i].gObj.style.top = d - playerW + 10 + "px";
			if (players[i].direction == 2) players[i].direction = 0;
		} else if (parseInt(players[i].gObj.style.top) <= 10) {
			players[i].gObj.style.top = 10 + "px";
			if (players[i].direction == 0) players[i].direction = 2;
		}
	}
}

function calculatePercentes() {
	let imageData = ctx.getImageData(0, 0, d, d);
	let pixelsSum = [];
	let colors = [];

	for (var i = 0; i < players.length; i++) {
		colors.push(hexToRgb(players[i].color));
		pixelsSum.push(0);
	}
	
	for (let i = 0; i < imageData.data.length; i += 4) {
		for (let j = 0; j < players.length; j++) {
			if (imageData.data[i + 0] == colors[j].r
				&& imageData.data[i + 1] == colors[j].g
				&& imageData.data[i + 2] == colors[j].b) {
				pixelsSum[j]++;
			}
		}
	}

	document.getElementsByClassName("pl-percentes")[0].innerHTML = Math.round(400 * pixelsSum[0] / imageData.data.length) + "%";
	document.getElementsByClassName("pl-percentes")[1].innerHTML = Math.round(400 * pixelsSum[1] / imageData.data.length) + "%";
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : alert("Error: HEX color have invalid value");
}

function onKeyDown(e) {
	if (e.type == "keydown") {
		if (e.code == "Space") {
			if (gameStarted) {
				if (gamePaused) 
					resume();
				else 
					pause();
			} else 
				start();

			return;
		}

		if (gameStarted && !gamePaused) {
			for (let i = 0; i < players.length; i++) {
				if (e.code == players[i].key.up) players[i].direction = 0;
				else if (e.code == players[i].key.right) players[i].direction = 1;
				else if (e.code == players[i].key.down) players[i].direction = 2;
				else if (e.code == players[i].key.left) players[i].direction = 3;
				else if (e.code == players[i].key.paint) paint(i);
			}
		}
	}
}

function Player(color, resp, direction, key) {
	this.color = color;
	this.resp = resp;
	this.direction = direction;
	this.key = key;
	this.gObj = document.createElement("div");
	this.gObj.className = "player";
	this.gObj.style.backgroundColor = color;
	document.getElementById("players-container").append(this.gObj);
}
