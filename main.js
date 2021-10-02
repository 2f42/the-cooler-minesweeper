
const canvas = document.getElementById("🅱️ineswee🅱️er");

const display = {
	marginLeft: 32,
	marginTop: 32,
	cellWidth: 32,
	cellPadding: 4,

	highlightTooManyFlags: false,
	darkenComplete: false
};

const game = {
	width: 0,
	height: 0,
	mines: 0,

	firstClick: false,
	dead: true,
	showOnDeath: true,

	tiles: [],

	getNeighbours: getNeighboursClassic,

	selected: -1,
	highlighted: []
};


function Tile (x, y) {
	this.x = x;
	this.y = y;

	this.mine = false;
	this.hidden = false;
	
	this.revealed = false;
	this.flagged = 0;

	this.adjacent = 0;
}


function toGrid (x, y) {
	return x + y * game.width;
}

function canvasToGrid (x, y) {
	// convert a canvas coordinate to a grid index

	let adjustedX = x - display.marginLeft - display.cellPadding;
	let adjustedY = y - display.marginTop - display.cellPadding;

	let cellTotalSize = display.cellWidth+display.cellPadding;

	if (adjustedX < 0 || adjustedX >= game.width * cellTotalSize - display.cellPadding ||
		adjustedY < 0 || adjustedY >= game.height * cellTotalSize - display.cellPadding) {

		return -1;
	}

	if (adjustedX%cellTotalSize >= display.cellWidth ||
		adjustedY%cellTotalSize >= display.cellWidth) {

		return -1;
	}

	return toGrid(Math.floor(adjustedX/cellTotalSize), Math.floor(adjustedY/cellTotalSize));
}

function isInGrid (x, y) {
	return x >= 0 && x < game.width && y >= 0 && y < game.height;
}


function cellOnTopEdge (index) {
	return index < game.width;
}

function cellOnBottomEdge (index) {
	return index >= (game.height - 1)*game.width;
}

function cellOnLeftEdge (index) {
	return index % game.width == 0;
}

function cellOnRightEdge (index) {
	return index % game.width == game.width - 1;
}


function getNeighboursClassic (index) {
	let left = !cellOnLeftEdge(index);
	let right = !cellOnRightEdge(index);
	let top = !cellOnTopEdge(index);
	let bottom = !cellOnBottomEdge(index);

	let neighbours = [];

	if (left && top)
		neighbours.push(index - game.width - 1);
	if (left && bottom)
		neighbours.push(index + game.width - 1);
	if (right && top)
		neighbours.push(index - game.width + 1);
	if (right && bottom)
		neighbours.push(index + game.width + 1);
	if (left)
		neighbours.push(index - 1);
	if (right)
		neighbours.push(index + 1);
	if (top)
		neighbours.push(index - game.width);
	if (bottom)
		neighbours.push(index + game.width);

	return neighbours;
}

function getNeighboursKnight (index) {
	let x = game.tiles[index].x;
	let y = game.tiles[index].y;

	let neighbours = [];

	if (isInGrid(x-2, y-1))
		neighbours.push(toGrid(x-2, y-1));
	if (isInGrid(x+2, y-1))
		neighbours.push(toGrid(x+2, y-1));
	if (isInGrid(x-2, y+1))
		neighbours.push(toGrid(x-2, y+1));
	if (isInGrid(x+2, y+1))
		neighbours.push(toGrid(x+2, y+1));
	if (isInGrid(x-1, y-2))
		neighbours.push(toGrid(x-1, y-2));
	if (isInGrid(x+1, y-2))
		neighbours.push(toGrid(x+1, y-2));
	if (isInGrid(x-1, y+2))
		neighbours.push(toGrid(x-1, y+2));
	if (isInGrid(x+1, y+2))
		neighbours.push(toGrid(x+1, y+2));

	return neighbours;
}

function countNeighouringMines (index) {
	let count = 0;
	game.getNeighbours(index).forEach(i => {
		count += game.tiles[i].mine ? 1 : 0;
	});
	return count;
}

function countNeighbouringFlags (index) {
	let count = 0;
	game.getNeighbours(index).forEach(i => {
		count += game.tiles[i].flagged == 1 ? 1 : 0;
	});
	return count;
}


function revealCell (index) {
	game.tiles[index].revealed = true;
	if (game.tiles[index].mine) {
		window.alert("oh no YOU're deAD!");
		game.dead = true;
		if (game.showOnDeath) {
			game.tiles.forEach(t => {
				if (t.mine) {
					t.revealed = true;
				}
			});
		}
	} else if (!game.tiles[index].hidden) {
		if (countNeighouringMines(index) == 0) {
			game.getNeighbours(index).forEach(i => {
				if (!game.tiles[i].revealed)
					revealCell(i);
			});
		}
	}
}

function chordCell (index) {
	if (countNeighbouringFlags(index) == countNeighouringMines(index)) {
		game.getNeighbours(index).forEach(i => {
			if (!game.tiles[i].revealed && game.tiles[i].flagged != 1)
				revealCell(i);
		});
	}
}

function flagCell (index) {
	game.tiles[index].flagged = (game.tiles[index].flagged + 1) % 3;
}


function onMouseDown (e) {
	e.preventDefault();

	if (game.dead) {
		draw();
		return;
	}

	let index = canvasToGrid(e.offsetX, e.offsetY);

	if (index != -1) {
		if (e.button == 2 && !game.tiles[index].revealed) {
			flagCell(index);
		} else if (e.button == 0 && !game.tiles[index].flagged) {
			if (game.tiles[index].revealed) {
				game.highlighted = game.getNeighbours(index);
				game.highlighted.push(index);
			}
			game.selected = index;
		}
	}

	draw();
}

function onMouseUp (e) {
	e.preventDefault();

	let index = canvasToGrid(e.offsetX, e.offsetY);

	if (e.button == 0 && !game.tiles[index].flagged && index == game.selected) {
		if (game.firstClick) {
			game.firstClick = false;
			let excluded = game.getNeighbours(index);
			excluded.push(index);
			addMines(game.mines, excluded);
			revealCell(index);
		} else if (game.tiles[index].revealed) {
			chordCell(index);
		} else {
			revealCell(index);
		}
	}

	game.highlighted = [];
	game.selected = -1;

	draw();
}



function drawBorder (ctx) {
	ctx.strokeStyle = "white";
	let cellSize = display.cellWidth+display.cellPadding;
	ctx.strokeRect(display.marginLeft, display.marginTop, cellSize*game.width+display.cellPadding, cellSize*game.height+display.cellPadding);
}

function drawCell (ctx, index, x, y) {
	let fill = false;
	ctx.fillStyle = "white";
	if (!game.tiles[index].revealed) {
		if (game.tiles[index].flagged == 0) {
			if (index == game.selected || game.highlighted.includes(index)) {
				ctx.fillStyle = "dimgrey";
			} else {
				ctx.fillStyle = "grey";
			}
			fill = true;
		} else if (game.tiles[index].flagged == 1) {
			ctx.fillStyle = "red";
			fill = true;
		} else if (game.tiles[index].flagged == 2) {
			ctx.fillStyle = "green";
			fill = true;
		}
	}

	if (display.highlightTooManyFlags && game.tiles[index].revealed && !game.tiles[index].hidden && countNeighbouringFlags(index) > countNeighouringMines(index)) {
		ctx.strokeStyle = "red";
		ctx.fillStyle = "red";
	} else if (display.darkenComplete && game.tiles[index].revealed && 
		game.getNeighbours(index).length == game.getNeighbours(index).filter(t => { return game.tiles[t].revealed || game.tiles[t].flagged; }).length &&
		countNeighouringMines(index) == countNeighbouringFlags(index)) {
		ctx.strokeStyle = "grey";
		ctx.fillStyle = "grey";
	} else {
		ctx.strokeStyle = "grey";
	}
	ctx.strokeRect(x, y, display.cellWidth, display.cellWidth);

	if (fill) {
		ctx.fillRect(x, y, display.cellWidth, display.cellWidth);
	} else {

		if (!game.tiles[index].mine) {
			let n = countNeighouringMines(index);
			ctx.fillText(n ? n : " ", x+display.cellWidth/2, y+display.cellWidth/2);
		} else {
			ctx.fillText("🅱️", x+display.cellWidth/2, y+display.cellWidth/2);
		}
	}
}

function drawGrid (ctx) {
	ctx.strokeStyle = "grey";
	ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (let x=0;x<game.width;x++) {
		let cellX = display.marginLeft+display.cellPadding+x*(display.cellWidth+display.cellPadding);
		for (let y=0;y<game.height;y++) {
			let cellY = display.marginTop+display.cellPadding+y*(display.cellWidth+display.cellPadding);

			let cellIndex = toGrid(x, y);

			drawCell(ctx, cellIndex, cellX, cellY);
		}
	}
}


function draw () {
	display.highlightTooManyFlags = document.getElementById("highlightTooManyFlags").checked;
	display.darkenComplete = document.getElementById("darkenComplete").checked;

	let ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (game.tiles.filter(t => { return t.revealed; }).length == game.width*game.height - game.mines && !game.dead) {
		window.alert("you win?");
		game.dead = true;
		game.tiles.forEach(t => {
			if (t.mine) {
				t.flagged = 1;
			}
		});
	}

	let remaining = game.mines - game.tiles.filter(t => { return t.flagged == 1; }).length;
	document.getElementById("minecount").innerHTML = remaining;

	drawBorder(ctx);
	drawGrid(ctx);
}


function addMines (n, excluded) {
	console.log("adding mines!");
	let mines = [];
	for (let i=0;i<n;i++) {
		while (1) {
			let m = Math.floor(Math.random()*game.width*game.height);
			if (!mines.includes(m) && !excluded.includes(m)) {
				mines.push(m);
				break;
			}
		}

		if (excluded.length + mines.length >= game.width*game.height) {
			game.mines = mines.length;
			window.alert("you chose to put down too many mines, so the total number of mines has gone down (and you will win after clicking once, because what else did you think would happen)");
			break;
		}
	}

	mines.forEach(m => {
		game.tiles[m].mine = true;
	});
}


function startGame() {
	let w = parseInt(document.getElementById("width").value);
	let h = parseInt(document.getElementById("height").value);
	let m = parseInt(document.getElementById("mines").value);
	let v = document.getElementById("variant").value;
	initGame(w, h, m, v);
}


function initGame (width, height, mines, variant) {
	game.width = width;
	game.height = height;
	game.mines = mines;

	game.firstClick = true;
	game.dead = false;
	game.showOnDeath = true;

	game.tiles = [];

	for (let y=0;y<height;y++) {
		for (let x=0;x<width;x++) {
			game.tiles.push(new Tile(x, y));
		}
	}

	switch (variant) {
		case "knight":
			game.getNeighbours = getNeighboursKnight;
			break;
		case "classic":
		default:
			game.getNeighbours = getNeighboursClassic;
			break;
	}

	canvas.width = display.marginLeft*2 + (display.cellWidth+display.cellPadding)*game.width + display.cellPadding;
	canvas.height = display.marginTop*2 + (display.cellWidth+display.cellPadding)*game.height + display.cellPadding;

	draw();
}


window.onload = function () {
	startGame();
};

//window.addEventListener("keypress", e => { display.cellWidth++; window.onload(); });
canvas.addEventListener("contextmenu", e => { e.preventDefault(); } );
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);