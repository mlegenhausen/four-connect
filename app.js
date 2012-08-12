(function(window, document, undefined) {
	"use strict";

	function Player(name, style) {
		this.style = style;
		this.name = name;
	}

	var ROWS = 6;
	var COLUMNS = 7;
	var STATE = {
		RUNNING: 'running',
		WON: 'won',
		EVEN: 'even'
	};

	var players = [
		new Player('Gelb', 'player-yellow'), 
		new Player('Rot', 'player-red')
	];
	var current = 0;
	var state = STATE.RUNNING;
	var model = initModel();
	var table = document.getElementById('field');

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
		var player = players[current];
		var elem = document.getElementById('player');
		var message = player.name;
		var style = player.style;
		if (state === STATE.RUNNING) {
			message += ' ist am Zug.';
		} else if (state === STATE.WON) {
			message += ' hat gewonnen!';
		} else {
			message = 'Das Spiel endet unendschieden.';
			style = 'even';
		}
		elem.innerHTML = message;
		elem.className = style;
	}

	function renderModel() {
		var player;
		for (var i = 0; i < ROWS; i++) {
			for (var j = 0; j < COLUMNS; j++) {
				player = model[i][j];
				table.rows[i].cells[j].className = player ? player.style : '';
			}
		}
	}

	function nextPlayer() {
		current = ++current % players.length;
		renderPlayer();
	}

	function hasWon() {
		var player = players[current];
		var connectedColumns, connectedRows, connectedDiagonals;

		// Look for cols
		for (var i = 0; i < COLUMNS; i++) {
			connectedColumns = 0;
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

		for (var i = 0; i < ROWS; i++) {
			connectedRows = 0;
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

	function isEven() {
		for(var i = 0; i < ROWS; i++) {
			for (var j = 0; j < COLUMNS; j++) {
				if (!model[i][j]) return false;
			}
		}
		return true;
	}

	function columnClick(col) {
		if (state !== STATE.RUNNING) return false;

		var row = -1;
		for (var i = 0; i < ROWS; i++) {
			if (!model[i][col]) row = i;
		}
		if (row > -1) {
			model[row][col] = players[current];
			if (isEven()) {
				state = STATE.EVEN;
				renderPlayer();
			} else if (hasWon()) {
				state = STATE.WON;
				renderPlayer();
			} else {
				nextPlayer();
			}
			renderModel();
		}
	}

	function columnMouseOver(col) {
		for(var i = 0; i < ROWS; i++) {
			table.rows[i].cells[col].className += ' column-hover';
		}
	}

	function columnMouseOut(col) {
		var cell;
		for(var i = 0; i < ROWS; i++) {
			cell = table.rows[i].cells[col];
			cell.className = cell.className.replace(' column-hover', '');
		}
	}

	function buildTable() {
		var row, col;
		for (var i = 0; i < ROWS; i++) {
			row = document.createElement('tr');
			for (var j = 0; j < COLUMNS; j++) {
				col = document.createElement('td');
				col.onclick = columnClick.bind(this, j);
				col.onmouseover = columnMouseOver.bind(this, j);
				col.onmouseout = columnMouseOut.bind(this, j);
				row.appendChild(col);
			}
			table.appendChild(row);
		}
	}

	buildTable();
	renderPlayer();
})(window, document);