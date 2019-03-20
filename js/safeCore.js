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
	xAxis: {
		offset: 30,
		padding: 10,
		// lines: dynamic
		color: '#CFCFCFCF',
	},
	yAxis: {
		offset: 30,
		padding: 0,
		labels: 6,
		lines: 6,
		color: '#ADADADAD',
	},
	lineJoin: 'round',
	rowHeight: 60,
	rowWidth: 60,	// dynamic
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
	ctx.translate(0, -DEFAULTS.yAxis.offset)
	ctx.beginPath()
	// yAxis labels (static)
	for (var i = 0; i < rowCount; i++) {
		ctx.fillText(rowHeight * i, 0, CANVAS.height - rowHeight * i)
	}
	ctx.stroke()

	ctx.textAlign = 'center'
	ctx.translate(DEFAULTS.xAxis.offset, DEFAULTS.yAxis.offset)
	ctx.beginPath()
	// xAxis labels (dynamic)
	for (var i = 0; i < colCount; i++) {
		ctx.fillText(t2d(theAxes.data[i]), rowWidth * i, CANVAS.height - DEFAULTS.xAxis.padding)
	}
	ctx.stroke()
	
	ctx.translate(0, -DEFAULTS.yAxis.offset)
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
			ctx.beginPath()
			ctx.arc(DEFAULTS.rowWidth*i, rev(dot), 5, 0, 2 * Math.PI)
			ctx.stroke()
		})

	})
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

const CANVAS = document.getElementById("safeChart")
CANVAS.setAttribute('height', `${DEFAULTS.yAxis.lines * DEFAULTS.rowHeight + DEFAULTS.yAxis.offset}px`)
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
