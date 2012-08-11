(function(window, document, undefined) {
	"use strict";

	function Player(name, color) {
		this.color = color;
		this.name = name;
	}

	var ROWS = 6;
	var COLUMNS = 7;

	var players = [
		new Player('Blau', '#0000FF'), 
		new Player('Rot', '#FF0000')
	];
	var current = 0;
	var running = true;
	var model = initModel();
	var table = document.querySelector('tbody');

	function initModel() {
		var model = [], row;
		for (var i = 0; i < ROWS; i++) {
			row = [];
			for (var j = 0; j < COLUMNS; j++) {
				row.push(null);
			}
			model.push(row);
		}
		return model;
	}

	function renderPlayer() {
		var elem = document.getElementById('player');
		var player = players[current];
		var message = player.name + (running ? ' ist am Zug.' : ' hat gewonnen!');
		elem.innerHTML = message;
		elem.style.color = player.color;
	}

	function renderModel() {
		var cell, player;
		for (var i = 0; i < model.length; i++) {
			for (var j = 0; j < model[i].length; j++) {
				cell = table.children[i].children[j];
				player = model[i][j];
				cell.style['background-color'] = player ? player.color : 'white';
			}
		}
	}

	function nextPlayer() {
		current = ++current % players.length;
		renderPlayer();
	}

	function hasWon() {
		var player = players[current];
		// Look for cols
		var connectedColumns = 0;
		for (var i = 0; i < COLUMNS; i++) {
			for (var j = 0; j < ROWS; j++) {
				if (model[j][i] === player) {
					connectedColumns++;
				} else {
					connectedColumns = 0;
				}
				if (connectedColumns >= 4) {
					return true;
				}
			}
		}

		var connectedRows = 0;
		var connectedDiagonals = 0;
		for (var i = 0; i < ROWS; i++) {
			for (var j = 0; j < COLUMNS; j++) {
				// Look for connected rows
				if (model[i][j] === player) {
					connectedRows++;
				} else {
					connectedRows = 0;
				}
				if (connectedRows >= 4) {
					return true;
				}
				// Look for connected diagonals
				// Diagonals going to the right
				connectedDiagonals = 0;
				for (var k = i, l = j; k < ROWS && l < COLUMNS; k++, l++) {
					if (model[k][l] === player) {
						connectedDiagonals++;
					} else {
						connectedDiagonals = 0;
					}
					if (connectedDiagonals >= 4) {
						return true;
					}
				}
				// Diagonals going to the left
				connectedDiagonals = 0;
				for (var k = i, l = j; k < ROWS && l >= 0; k++, l--) {
					if (model[k][l] === player) {
						connectedDiagonals++;
					} else {
						connectedDiagonals = 0;
					}
					if (connectedDiagonals >= 4) {
						return true;
					}
				}
			}
		}
		return false;
	}

	window.columnClick = function(col) {
		if (!running) return false;

		var row = -1;
		for (var i = 0; i < ROWS; i++) {
			if (!model[i][col]) row = i;
		}
		if (row > -1) {
			model[row][col] = players[current];
			if (hasWon()) {
				running = false;
				renderPlayer();
			} else {
				nextPlayer();
			}
			renderModel();
		}
	};

	renderPlayer();
})(window, document);