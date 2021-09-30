
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


function countNeighouringMines (index) {
	let left = !cellOnLeftEdge(index);
	let right = !cellOnRightEdge(index);
	let top = !cellOnTopEdge(index);
	let bottom = !cellOnBottomEdge(index);

	let count = 0;

	if (left && top)
		count += game.tiles[index - game.width - 1] == "m" ? 1 : 0;
	if (left && bottom)
		count += game.tiles[index + game.width - 1] == "m" ? 1 : 0;
	if (right && top)
		count += game.tiles[index - game.width + 1] == "m" ? 1 : 0;
	if (right && bottom)
		count += game.tiles[index + game.width + 1] == "m" ? 1 : 0;
	if (left)
		count += game.tiles[index - 1] == "m" ? 1 : 0;
	if (right)
		count += game.tiles[index + 1] == "m" ? 1 : 0;
	if (top)
		count += game.tiles[index - game.width] == "m" ? 1 : 0;
	if (bottom)
		count += game.tiles[index + game.width] == "m" ? 1 : 0;

	return count;
}


function handleMouse (e) {
	e.preventDefault();

	// if in grid, you Clicked a Cell
	let gridIndex = canvasToGrid(e.offsetX, e.offsetY);

	if (gridIndex != -1) {
		let msg = e.button == 0 ? "left " : e.button == 1 ? "middle " : "right ";
		msg += "clicked cell " + gridIndex;
		console.log(msg);
		console.log(
			cellOnTopEdge(gridIndex) ? " " : "↑",
			cellOnLeftEdge(gridIndex) ?  " " : "←",
			cellOnRightEdge(gridIndex) ?  " " : "→",
			cellOnBottomEdge(gridIndex) ?  " " : "↓"
		);

		if (e.button == 0 && !game.marked[gridIndex] && !game.revealed[gridIndex]) {
			game.revealed[gridIndex] = true;
			console.log("REVEALED!");
		} else if (e.button == 2 && !game.revealed[gridIndex]) {
			game.marked[gridIndex] = (game.marked[gridIndex] + 1) % 3;
			console.log("flagged");
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

			if (!game.revealed[cellIndex] && game.marked[cellIndex] == 0) {
				ctx.fillStyle = "grey";
				fill = true;
			} else if (game.marked[cellIndex] == 1) {
				ctx.fillStyle = "red";
				fill = true;
			} else if (game.marked[cellIndex] == 2) {
				ctx.fillStyle = "green";
				fill = true;
			}

			if (fill) {
				ctx.fillRect(cellX, cellY, display.cellWidth, display.cellWidth);
			} else {
				ctx.fillStyle = "white";
				let n = countNeighouringMines(cellIndex)
				ctx.fillText(n ? n : " ", cellX+display.cellWidth/2, cellY+display.cellWidth/2);
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
}


function addMines (n) {
	let mines = [];
	for (i=0;i<n;i++) {
		while (1) {
			let m = Math.floor(Math.random()*game.width*game.height);
			if (!(m in mines)) {
				mines.push(m);
				break;
			}
		}
	}

	mines.forEach(mine => {
		game.tiles[mine] = "m";
	});
}


function initGame (width, height) {
	game.width = width;
	game.height = height;

	game.tiles = Array(width*height).fill(" ");
	game.revealed = Array(width*height).fill(false);
	game.marked = Array(width*height).fill(0);

	addMines(10);

	canvas.width = display.marginLeft*2 + (display.cellWidth+display.cellPadding)*game.width + display.cellPadding;
	canvas.height = display.marginTop*2 + (display.cellWidth+display.cellPadding)*game.height + display.cellPadding;

	draw();
}


window.onload = function () {
	initGame(9, 9);
};

window.addEventListener("keypress", e => { display.cellWidth++; window.onload(); });
canvas.addEventListener("contextmenu", e => { e.preventDefault(); } );
canvas.addEventListener("mousedown", handleMouse);