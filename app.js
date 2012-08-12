(function(window, document, undefined) {
	"use strict";

	function Player(name, style) {
		this.style = style;
		this.name = name;
	}

	// Init consts
	var ROWS = 6;
	var COLUMNS = 7;
	var STATE = {
		RUNNING: 'running',
		WON: 'won',
		EVEN: 'even'
	};

	// Init game vars
	var players = [
		new Player('Gelb', 'player-yellow'), 
		new Player('Rot', 'player-red')
	];
	var current = 0;
	var state = STATE.RUNNING;
	var field = initField();

	// Fetch DOM elements.
	var $field = document.getElementById('field');
	var $player = document.getElementById('player');

	function initField() {
		var field = [];
		var row; 
		var i; 
		var j;
		
		for (i = 0; i < ROWS; i++) {
			row = [];
			for (j = 0; j < COLUMNS; j++) {
				row.push(null);
			}
			field.push(row);
		}
		return field;
	}

	function renderPlayer() {
		var player = players[current];
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
		$player.innerHTML = message;
		$player.className = style;
	}

	function renderField() {
		var player; 
		var i; 
		var j;

		for (i = 0; i < ROWS; i++) {
			for (j = 0; j < COLUMNS; j++) {
				player = field[i][j];
				$field.rows[i].cells[j].className = player ? player.style : '';
			}
		}
	}

	function nextPlayer() {
		current = ++current % players.length;
		renderPlayer();
	}

	// Check if the player has won
	function hasWon(player) {
		var connectedColumns;
		var connectedRows;
		var connectedDiagonals;
		var i;
		var j; 
		var k; 
		var l;

		// Look for cols
		for (i = 0; i < COLUMNS; i++) {
			connectedColumns = 0;
			for (j = 0; j < ROWS; j++) {
				if (field[j][i] === player) {
					connectedColumns++;
				} else {
					connectedColumns = 0;
				}
				if (connectedColumns >= 4) {
					return true;
				}
			}
		}

		for (i = 0; i < ROWS; i++) {
			connectedRows = 0;
			for (j = 0; j < COLUMNS; j++) {
				// Look for connected rows
				if (field[i][j] === player) {
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
				for (k = i, l = j; k < ROWS && l < COLUMNS; k++, l++) {
					if (field[k][l] === player) {
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
				for (k = i, l = j; k < ROWS && l >= 0; k++, l--) {
					if (field[k][l] === player) {
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
		var i; 
		var j;
		
		for(i = 0; i < ROWS; i++) {
			for (j = 0; j < COLUMNS; j++) {
				if (!field[i][j]) return false;
			}
		}
		return true;
	}

	function columnClick(col) {
		if (state !== STATE.RUNNING) return false;

		var row = -1;
		var	i;
		
		for (i = 0; i < ROWS; i++) {
			if (!field[i][col]) row = i;
		}
		if (row > -1) {
			field[row][col] = players[current];
			if (isEven()) {
				state = STATE.EVEN;
				renderPlayer();
			} else if (hasWon(players[current])) {
				state = STATE.WON;
				renderPlayer();
			} else {
				nextPlayer();
			}
			renderField();
		}
	}

	function columnMouseOver(col) {
		var i;
		for(i = 0; i < ROWS; i++) {
			$field.rows[i].cells[col].className += ' column-hover';
		}
	}

	function columnMouseOut(col) {
		var $cell, 
			i;
		
		for(i = 0; i < ROWS; i++) {
			$cell = $field.rows[i].cells[col];
			$cell.className = $cell.className.replace(' column-hover', '');
		}
	}

	function buildField() {
		var $row, 
			$col, 
			i, 
			j;
		
		for (i = 0; i < ROWS; i++) {
			$row = document.createElement('tr');
			for (j = 0; j < COLUMNS; j++) {
				$col = document.createElement('td');
				$col.onclick = columnClick.bind(this, j);
				$col.onmouseover = columnMouseOver.bind(this, j);
				$col.onmouseout = columnMouseOut.bind(this, j);
				$row.appendChild($col);
			}
			$field.appendChild($row);
		}
	}

	buildField();
	renderPlayer();
})(window, document);