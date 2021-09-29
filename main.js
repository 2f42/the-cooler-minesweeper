
const canvas = document.getElementById("🅱️ineswee🅱️er");

const display = {
	marginLeft: 32,
	marginTop: 32,
	cellWidth: 32,
	cellPadding: 4
};

const game = {
	width: 10,
	height: 10
};


function canvasToGrid (x, y) {
	var adjustedX = x - display.marginLeft - display.cellPadding;
	var adjustedY = y - display.marginTop - display.cellPadding;

	var cellTotalSize = display.cellWidth+display.cellPadding;

	if (adjustedX < 0 || adjustedX >= game.width * cellTotalSize - display.cellPadding ||
		adjustedY < 0 || adjustedY >= game.height * cellTotalSize - display.cellPadding) {

		console.log("outside Grid");
		return -1;
	}

	if (adjustedX%cellTotalSize >= display.cellWidth ||
		adjustedY%cellTotalSize >= display.cellWidth) {

		console.log("on borders");
		return -1;
	}

	return Math.floor(adjustedX/cellTotalSize) + Math.floor(adjustedY/cellTotalSize) * game.width;
}


function drawBorder () {
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = "white";
	var cellSize = display.cellWidth+display.cellPadding;
	ctx.strokeRect(display.marginLeft, display.marginTop, cellSize*game.width+display.cellPadding, display.cellSize*game.height+display.cellPadding);
}

function drawGrid () {
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = "grey";

	for (x=0;x<game.width;x++) {
		var cellX = display.marginLeft+display.cellPadding+x*(display.cellWidth+display.cellPadding);
		for (y=0;y<game.height;y++) {
			var cellY = display.marginTop+display.cellPadding+y*(display.cellWidth+display.cellPadding);
			ctx.strokeRect(cellX, cellY, display.cellWidth, display.cellWidth);
		}
	}
}


window.onload = function () {
	canvas.width = display.marginLeft*2 + (display.cellWidth+display.cellPadding)*game.width + display.cellPadding;
	canvas.height = display.marginTop*2 + (display.cellWidth+display.cellPadding)*game.height + display.cellPadding;

	canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);

	drawBorder();
	drawGrid();
};

window.addEventListener("keypress", e => { display.cellWidth++; window.onload(); });
canvas.addEventListener("contextmenu", e => { e.preventDefault(); } );
canvas.addEventListener("mousedown", e => { console.log(canvasToGrid(e.offsetX, e.offsetY)); });