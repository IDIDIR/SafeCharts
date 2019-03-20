/*
  * SafeCharts
   * Copyright 2019 The AICC inc.
    * Very speed, efficiency and the size of the app
     * * * * * * * * * * * * * * * * * * * * * * * * */

"use strict"

// project pride
var rev =(y)=> (CANVAS.height-y*DEFAULTS.scale)
var t2d =(t)=> ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(new Date(t)).getMonth()]+' '+(new Date(t)).getDate()

var theLines = Array()
var theAxes = Object()
class Line {
  constructor(line) {
    this.name  = line.name
    this.color = line.color
    this.data  = line.data
  }
}

const DEFAULTS = {
	scale: 0.0001,	// canvas scale does not work correctly((9
	lineJoin: 'round',
	rowHeight: 60,
	rowWidth: 60,	// dynamic
	xAxis: {
		// offset: 0,	// dynamic
		margin: 30,
		padding: 10,
		// lines: dynamic,
		color: '#CFCFCFCF',
		step: 1,
	},
	yAxis: {
		// offset: 0,	// dynamic
		margin: 30,
		padding: 0,
		labels: 6,
		color: '#ADADADAD',
		lines: 6,
		step: 60,
	},
}

var parseBadStruct = function() {
	let keys = Array()
	// bazat is a connecting link in any incomprehensible situation
	bigdata.columns.map((bazat)=>keys.push(bazat[0]))
	keys.forEach((key,i)=>{
		if(bigdata.types[key]=="line"){
			let line = Object()
			line.name  = bigdata.names[key]
			line.color = bigdata.colors[key]
			line.data  = bigdata.columns[i].slice(1)
			theLines[key] = new Line(line)
		} else {
			theAxes.data = bigdata.columns[i].slice(1)
			console.log(`${theAxes.data.length} days`)
		}
	})
}

var drawAxisLables = function() {	
	let rowCount = DEFAULTS.yAxis.labels
	let colCount = theAxes.data.length
	let rowHeight = DEFAULTS.rowHeight
	let rowWidth  = DEFAULTS.rowWidth
	ctx.font = "1em Candara"
	ctx.fillStyle = DEFAULTS.yAxis.color

	ctx.textAlign = 'left'
	ctx.translate(0, -DEFAULTS.yAxis.margin)
	ctx.beginPath()
	// yAxis labels (static)
	for (var i = 0; i < rowCount; i++) {
		ctx.fillText(rowHeight * i, 0, CANVAS.height - rowHeight * i)
	}
	ctx.stroke()

	ctx.textAlign = 'center'
	ctx.translate(DEFAULTS.xAxis.margin, DEFAULTS.yAxis.margin)
	ctx.beginPath()
	// xAxis labels (dynamic)
	for (var i = 0; i < colCount; i++) {
		ctx.fillText(t2d(theAxes.data[i]), rowWidth * i, CANVAS.height - DEFAULTS.xAxis.padding)
	}
	ctx.stroke()
	
	ctx.translate(0, -DEFAULTS.yAxis.margin)
}

var drawPlotLines = function() {
	let rowCount = DEFAULTS.yAxis.labels
	let colCount = theAxes.data.length
	let rowHeight = DEFAULTS.rowHeight
	let rowWidth  = DEFAULTS.rowWidth
	ctx.lineWidth = 0.5
	ctx.strokeStyle = DEFAULTS.xAxis.color
	ctx.beginPath()
	// yAxis lines
	for (var i = 0; i < rowCount; i++) {
		ctx.moveTo(0, CANVAS.height - rowHeight * i)								// 1
		ctx.lineTo(CANVAS.width, CANVAS.height - rowHeight * i)			// 2
	}
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = '#E9E9E9E9'
	// xAxis lines
	for (var i = 0; i < colCount; i++) {
		// because need to think like the bottom left origin
		ctx.moveTo(rowWidth * i, CANVAS.height)										// 2
		ctx.lineTo(rowWidth * i, 0)																// 1
	}
	ctx.stroke()
}

var drawEtcChart = function() {
	ctx.lineWidth = 2.5
	ctx.lineJoin = DEFAULTS.lineJoin
	Object.entries(theLines).forEach(([key,line]) => {
		
		ctx.strokeStyle = line.color
		ctx.beginPath()
		line.data.forEach((dot,i) => {
			(!i)?ctx.moveTo(DEFAULTS.rowWidth*i, rev(dot)):ctx.lineTo(DEFAULTS.rowWidth*i, rev(dot));
		})
		ctx.stroke()

		line.data.forEach((dot,i) => {
			if(i) {
				ctx.beginPath()
				ctx.arc(DEFAULTS.rowWidth*i, rev(dot), 5, 0, 2 * Math.PI)
				ctx.clearRect(DEFAULTS.rowWidth*i-5,rev(dot)-5,5*2,5*2);
				ctx.stroke()
			}
		})

	})
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

const CANVAS = document.getElementById("safeChart")
const MAPSEL = document.getElementById("mapSelector")
const MAPLAY = document.getElementById("mapLayout")
CANVAS.setAttribute('height', `${DEFAULTS.yAxis.lines * DEFAULTS.rowHeight + DEFAULTS.yAxis.margin}px`)
CANVAS.setAttribute('width', `1000px`)
var ctx = CANVAS.getContext("2d")
// included in html
bigdata = bigdata[0]
console.log(bigdata)


// here it is necessary to keep silent
parseBadStruct()
// draw some labels
drawAxisLables()
// draw some lines
drawPlotLines()
// draw the rest of the chart
drawEtcChart()


// selector moves around the map only xAxis
let innerLeftOffset = 0
let lastClientX = MAPSEL.getBoundingClientRect().x
MAPSEL.addEventListener('mousedown', mouseDown, false)
window.addEventListener('mouseup', mouseUp, false)

function mouseUp(e) {
	let canvasFullWidth = DEFAULTS.rowWidth*theAxes.data.length
	const SELECTOR = MAPSEL.getBoundingClientRect()
	// render after mouseup (well, at least here the optimization was delivered)
	// ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)
	ctx.clearRect(0, 0, canvasFullWidth, CANVAS.height)
	ctx.translate( -(SELECTOR.x - lastClientX) * ( (canvasFullWidth - CANVAS.width) / (400 - SELECTOR.width) ), 0)
	lastClientX = SELECTOR.x
	drawEtcChart()
	window.removeEventListener('mousemove', move, true)
}
function mouseDown(e) {
	innerLeftOffset = MAPSEL.offsetLeft - e.clientX
	window.addEventListener('mousemove', move, true)
}
function move(e) {
	const SELECTOR = MAPSEL.getBoundingClientRect()
	const LAYOUT = MAPLAY.getBoundingClientRect()
	let offsetByParent = e.clientX + innerLeftOffset
	if(offsetByParent>=0&&offsetByParent<=(LAYOUT.width-SELECTOR.width)) MAPSEL.style.left = e.clientX + innerLeftOffset + 'px'
}
