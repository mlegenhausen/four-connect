(function(window, document, undefined) {
	"use strict";

	// Init consts
	var ROWS = 6;
	var COLUMNS = 7;
	var STATE = {
		RUNNING: 'running',
		WON: 'won',
		EVEN: 'even'
	};

	// Simple event emitter
	function EventEmitter() {
		this.listeners = {};
	}

	EventEmitter.prototype.on = function(event, fn, ctx) {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(fn.bind(ctx));
	};

	EventEmitter.prototype.emit = function(event) {
		var self = this;
		var args = Array.prototype.slice.call(arguments, 1);
		var listeners = this.listeners[event] || [];
		listeners.forEach(function(listener) {
			listener.apply(self, args);
		});
	};

	// Player Object
	function Player(name, style) {
		this.style = style;
		this.name = name;
	}

	// The player manager.
	function PlayerManager() {
		var self = this;
		this.players = [
			new Player('Gelb', 'player-yellow'), 
			new Player('Rot', 'player-red')
		];
		this._current = 0;
		
		Object.defineProperty(this, 'current', {
			get: function() {
				return self.players[self._current];
			}
		});
	}

	PlayerManager.prototype.next = function() {
		this._current = ++this._current % this.players.length;
	};

	// The Game logic
	function Game() {
		EventEmitter.call(this);
		this.state = STATE.RUNNING;
		this.field = this.initField();
		this.playerManager = new PlayerManager();

		var self = this;
		Object.defineProperty(this, 'currentPlayer', {
			get: function() {
				return self.playerManager.current;
			}
		});
	}

	Game.prototype = new EventEmitter();

	Game.prototype.initField = function() {
		var field = [], row, i, j;
		for (i = 0; i < ROWS; i++) {
			row = [];
			for (j = 0; j < COLUMNS; j++) {
				row.push(null);
			}
			field.push(row);
		}
		return field;
	};

	// Check if the player has won
	Game.prototype.hasWon = function(player) {
		var connectedColumns, connectedRows, connectedDiagonals, i, j, k, l;

		// Look for cols
		for (i = 0; i < COLUMNS; i++) {
			connectedColumns = 0;
			for (j = 0; j < ROWS; j++) {
				if (this.field[j][i] === player) {
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
				if (this.field[i][j] === player) {
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
					if (this.field[k][l] === player) {
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
					if (this.field[k][l] === player) {
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
	};

	Game.prototype.isEven = function() {
		var i, j;
		for(i = 0; i < ROWS; i++) {
			for (j = 0; j < COLUMNS; j++) {
				if (!this.field[i][j]) return false;
			}
		}
		return true;
	};

	Game.prototype.insertChip = function(col) {
		if (this.state !== STATE.RUNNING) return false;

		var row = -1, i;
		for (i = 0; i < ROWS; i++) {
			if (!this.field[i][col]) row = i;
		}
		if (row > -1) {
			this.field[row][col] = this.playerManager.current;
			if (this.isEven()) {
				this.state = STATE.EVEN;
			} else if (this.hasWon(this.playerManager.current)) {
				this.state = STATE.WON;
			} else {
				this.playerManager.next();
			}
			this.emit('state', this.state, this.playerManager.current);
		}
	};

	Game.prototype.playerAt = function(row, col) {
		return this.field[row][col];
	};

	// The game renderer
	function GameRenderer(game) {
		this.game = game;
		this.$field = document.getElementById('field');
		this.$player = document.getElementById('player');

		this.game.on('state', this.render, this);
	}

	GameRenderer.prototype.init = function() {
		var $row, $col, i, j;
		for (i = 0; i < ROWS; i++) {
			$row = document.createElement('tr');
			for (j = 0; j < COLUMNS; j++) {
				$col = document.createElement('td');
				$col.onclick = this.columnClick.bind(this, j);
				$col.onmouseover = this.columnMouseOver.bind(this, j);
				$col.onmouseout = this.columnMouseOut.bind(this, j);
				$row.appendChild($col);
			}
			this.$field.appendChild($row);
		}
		this.render();
	};

	GameRenderer.prototype.columnClick = function(col) {
		this.game.insertChip(col);
	};

	GameRenderer.prototype.columnMouseOver = function(col) {
		var i;
		for(i = 0; i < ROWS; i++) {
			this.$field.rows[i].cells[col].className += ' column-hover';
		}
	};

	GameRenderer.prototype.columnMouseOut = function(col) {
		var $cell, i;
		for(i = 0; i < ROWS; i++) {
			$cell = this.$field.rows[i].cells[col];
			$cell.className = $cell.className.replace(' column-hover', '');
		}
	};

	GameRenderer.prototype.renderField = function() {
		var player, i, j;
		for (i = 0; i < ROWS; i++) {
			for (j = 0; j < COLUMNS; j++) {
				player = this.game.playerAt(i, j);
				this.$field.rows[i].cells[j].className = player ? player.style : '';
			}
		}
	};

	GameRenderer.prototype.renderPlayer = function() {
		var player = this.game.currentPlayer;
		var message = player.name;
		var style = player.style;
		if (this.game.state === STATE.RUNNING) {
			message += ' ist am Zug.';
		} else if (this.game.state === STATE.WON) {
			message += ' hat gewonnen!';
		} else {
			message = 'Das Spiel endet unendschieden.';
			style = 'even';
		}
		this.$player.innerHTML = message;
		this.$player.className = style;
	};

	GameRenderer.prototype.render = function() {
		this.renderField();
		this.renderPlayer();
	};

	var game = new Game();
	var renderer = new GameRenderer(game);
	renderer.init();
})(window, document);