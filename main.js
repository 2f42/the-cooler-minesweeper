
const canvas = document.getElementById("🅱️ineswee🅱️er");

const display = {
	marginLeft: 32,
	marginTop: 32,
	cellWidth: 32,
	cellPadding: 4
};

const game = {
	width: 0,
	height: 0,
	mines: 0,
	firstClick: false,
	dead: true,
	tiles: [],
	revealed: [],
	marked: []
};


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

	return Math.floor(adjustedX/cellTotalSize) + Math.floor(adjustedY/cellTotalSize) * game.width;
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


function getNeighbours (index) {
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

function countNeighouringMines (index) {
	let count = 0;
	getNeighbours(index).forEach(i => {
		count += game.tiles[i] == "m" ? 1 : 0;
	});
	return count;
}

function countNeighbouringFlags (index) {
	let count = 0;
	getNeighbours(index).forEach(i => {
		count += game.marked[i] == 1 ? 1 : 0;
	});
	return count;
}


function revealCell (index) {
	game.revealed[index] = true;
	if (game.tiles[index] == "m") {
		window.alert("oh no YOU're deAD!");
		game.dead = true;
	} else if (game.tiles[index] == " ") {
		if (countNeighouringMines(index) == 0) {
			getNeighbours(index).forEach(i => {
				if (!game.revealed[i])
					revealCell(i);
			});
		}
	}
}

function chordCell (index) {
	if (countNeighbouringFlags(index) == countNeighouringMines(index)) {
		getNeighbours(index).forEach(i => {
			if (!game.revealed[i] && game.marked[i] != 1)
				revealCell(i);
		});
	}
}


function handleMouse (e) {
	e.preventDefault();

	// if in grid, you Clicked a Cell
	let gridIndex = canvasToGrid(e.offsetX, e.offsetY);

	if (gridIndex != -1 && !game.dead) {
		if (e.button == 0 && game.firstClick) {
			game.firstClick = false;
			let excluded = getNeighbours(gridIndex);
			excluded.push(gridIndex);
			addMines(game.mines, excluded);
		}

		if (e.button == 0 && !game.marked[gridIndex]) {
			if (game.revealed[gridIndex])
				chordCell(gridIndex);
			else
				revealCell(gridIndex);
		} else if (e.button == 2 && !game.revealed[gridIndex]) {
			game.marked[gridIndex] = (game.marked[gridIndex] + 1) % 3;
		}
	}

	draw();
}


function drawBorder (ctx) {
	ctx.strokeStyle = "white";
	let cellSize = display.cellWidth+display.cellPadding;
	ctx.strokeRect(display.marginLeft, display.marginTop, cellSize*game.width+display.cellPadding, cellSize*game.height+display.cellPadding);
}

function drawGrid (ctx) {
	ctx.strokeStyle = "grey";
	ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (x=0;x<game.width;x++) {
		let cellX = display.marginLeft+display.cellPadding+x*(display.cellWidth+display.cellPadding);
		for (y=0;y<game.height;y++) {
			let cellY = display.marginTop+display.cellPadding+y*(display.cellWidth+display.cellPadding);

			ctx.strokeRect(cellX, cellY, display.cellWidth, display.cellWidth);

			let cellIndex = x + y*game.width;
			let fill = false;

			if (!game.revealed[cellIndex]) {
				if (game.marked[cellIndex] == 0) {
					ctx.fillStyle = "grey";
					fill = true;
				} else if (game.marked[cellIndex] == 1) {
					ctx.fillStyle = "red";
					fill = true;
				} else if (game.marked[cellIndex] == 2) {
					ctx.fillStyle = "green";
					fill = true;
				}
			}

			if (fill) {
				ctx.fillRect(cellX, cellY, display.cellWidth, display.cellWidth);
			} else {
				ctx.fillStyle = "white";

				if (game.tiles[cellIndex] == " ") {
					let n = countNeighouringMines(cellIndex);
					ctx.fillText(n ? n : " ", cellX+display.cellWidth/2, cellY+display.cellWidth/2);
				} else {
					ctx.fillText(game.tiles[cellIndex], cellX+display.cellWidth/2, cellY+display.cellWidth/2);
				}
			}
		}
	}
}


function draw () {
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawBorder(ctx);
	drawGrid(ctx);
	if (game.revealed.filter(Boolean).length == game.width*game.height - game.mines) {
		window.alert("you win?");
	}
}


function addMines (n, excluded) {
	let mines = [];
	for (i=0;i<n;i++) {
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

	mines.forEach(mine => {
		game.tiles[mine] = "m";
	});
}


function startGame() {
	let w = parseInt(document.getElementById("width").value);
	let h = parseInt(document.getElementById("height").value);
	let m = parseInt(document.getElementById("mines").value);
	initGame(w, h, m);
}


function initGame (width, height, mines) {
	game.width = width;
	game.height = height;
	game.mines = mines;

	game.dead = false;

	game.tiles = Array(width*height).fill(" ");
	game.revealed = Array(width*height).fill(false);
	game.marked = Array(width*height).fill(0);
	game.firstClick = true;

	canvas.width = display.marginLeft*2 + (display.cellWidth+display.cellPadding)*game.width + display.cellPadding;
	canvas.height = display.marginTop*2 + (display.cellWidth+display.cellPadding)*game.height + display.cellPadding;

	draw();
}


window.onload = function () {
	startGame();
};

//window.addEventListener("keypress", e => { display.cellWidth++; window.onload(); });
canvas.addEventListener("contextmenu", e => { e.preventDefault(); } );
canvas.addEventListener("mousedown", handleMouse);