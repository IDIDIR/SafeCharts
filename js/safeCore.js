/*
  * SafeCharts
   * Copyright 2019 The AICC inc.
    * Very speed, efficiency and the size of the app
     * * * * * * * * * * * * * * * * * * * * * * * * */

"use strict"

// demo of reducing the size of the application
var yrv =(y)=> CANVAS.height-y*DEFAULTS.yAxis.scale*((CANVAS.height-DEFAULTS.xAxis.margin)/(DEFAULTS.yAxis.showedmax*DEFAULTS.yAxis.scale))
var t2d =(t)=> ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(new Date(t)).getMonth()]+' '+(new Date(t)).getDate()
var w2n =(w)=> w.replace('px','')
var n2w =(n)=> n+'px'

// elements
var CANVAS,MAPSEL,MAPLAY,SWTCHS,LEFTMS,RGHTMS
var ctx,mtx
// structures (allLines & allDates need a all-time sync)
var allLines = Array()
var allDates = Array()
var showLines = Array()
var showDates = Array()
var showArea = {from:0,to:0}
class Line {
  constructor(line) {
    this.name  = line.name
    this.color = line.color
    this.y  	 = line.y
    this.x  	 = line.x
  }
}
// etc
var lastClientX

const DEFAULTS = {
	lineJoin: 'round',
	rowHeight: 60,
	rowWidth: 60,	// dynamic
	xAxis: {
		scale: 1,
		// offset: 0,	// dynamic
		margin: 30,
		padding: 10,
		// lines: dynamic,
		color: '#CFCFCFCF',
		step: 1,
	},
	yAxis: {
		scale: 0.0001,	// canvas scale does not work correctly((9
		// offset: 0,	// dynamic
		margin: 30,
		padding: 10,
		labels: 6,
		color: '#ADADADAD',
		lines: 6,
		step: 60,
		showedmax: 0,
		globalmax: 0,
	},
}

var parseBadStruct = function() {
	// included in html
	bigdata = bigdata[0]
	console.log(bigdata)
	let keys = Array()
	// bazat is a connecting link in any incomprehensible situation
	bigdata.columns.map((bazat)=>keys.push(bazat[0]))
	keys.forEach((key,i)=>{
		if(bigdata.types[key]=="line"){
			let line = Object()
			line.name  = bigdata.names[key]
			line.color = bigdata.colors[key]
			line.y  	 = bigdata.columns[i].slice(1)
			line.x  	 = showDates
			allLines[key] = new Line(line)
			showLines[key] = new Line(line)
		} else {
			allDates = bigdata.columns[i].slice(1)
			showDates = bigdata.columns[i].slice(1)
			console.log(`${allDates.length} days`)
		}
	})
	// wow, "showLines=allLines" is not copy, is link o.O
	// showLines = Array.from(allLines)
}

var initSelectors = function() {
	CANVAS = document.getElementById("safeChart")
	MAPSEL = document.getElementById("mapSelector")
	MAPLAY = document.getElementById("mapLayout")
	SWTCHS = document.getElementById("chartSwitches")
	LEFTMS = document.getElementById("leftSide")
	RGHTMS = document.getElementById("rightSide")
	CANVAS.setAttribute('height', n2w(DEFAULTS.yAxis.lines * DEFAULTS.rowHeight + DEFAULTS.yAxis.margin))
	CANVAS.setAttribute('width', n2w(1000))
	MAPSEL.style.width = n2w(DEFAULTS.rowWidth * DEFAULTS.xAxis.scale * showDates.length / CANVAS.width)
	ctx = CANVAS.getContext("2d")
	mtx = MAPLAY.getContext("2d")
	let chartSwitches = ""
	Object.entries(showLines).forEach(([key,line]) => {
		chartSwitches +=
			`
			<button id="${key}" onclick="switchHandler(this)" type="button" class="btn btn-default waves-effect waves-light toggle-line">
				<span><i class="fa fa-check-square" style="color:${line.color}"></i></span>
				<span class="line-name">${line.name}</span>
			</button>
			`
	})
	SWTCHS.innerHTML = chartSwitches
}

var switchHandler = function(button) {
	let id = button.id
	if (Object.keys(showLines).includes(id)) {
		delete showLines[id]
		button.querySelector(`span>i`).classList.remove('fa-check-square')
		button.querySelector(`span>i`).classList.add('fa-square-o')
	} else {
		showLines[id] = allLines[id]
		button.querySelector(`span>i`).classList.remove('fa-square-o')
		button.querySelector(`span>i`).classList.add('fa-check-square')
	}
	redrawChartLines()	
	redrawMapLines()
}

var drawAxisLables = function() {
	DEFAULTS.yAxis.showedmax = 0
	DEFAULTS.yAxis.globalmax = 0
	Object.entries(showLines).forEach(([key, line])=>{
		// so that the schedule does not go beyond the workspace
		const additionalPadding = DEFAULTS.yAxis.padding/DEFAULTS.yAxis.scale
		let maxShowed = Math.max(...line.y.slice(showArea.from,showArea.to+2))
		let maxGlobal = Math.max(...line.y)
		if(maxShowed>DEFAULTS.yAxis.showedmax) {
			DEFAULTS.yAxis.showedmax=Math.ceil(maxShowed)+additionalPadding
		}
		if(maxGlobal>DEFAULTS.yAxis.globalmax) {
			DEFAULTS.yAxis.globalmax=Math.ceil(maxGlobal)+additionalPadding
		}
	})

	let rowCount = DEFAULTS.yAxis.labels
	// let colCount = showDates.length
	let rowHeight = DEFAULTS.rowHeight
	let rowWidth  = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
	ctx.font = "1em Candara"
	ctx.fillStyle = DEFAULTS.yAxis.color

	ctx.textAlign = 'left'
	ctx.translate(0, -DEFAULTS.yAxis.margin)
	ctx.beginPath()
	// yAxis labels (static)
	for (var i = 0; i < rowCount; i++) {
		ctx.fillText(parseInt(DEFAULTS.yAxis.showedmax * DEFAULTS.yAxis.scale / rowCount * i), 0, CANVAS.height - rowHeight * i - DEFAULTS.yAxis.padding)
		// ctx.fillText(rowHeight * i, 0, CANVAS.height - rowHeight * i - DEFAULTS.yAxis.padding)
	}
	ctx.stroke()

	ctx.textAlign = 'center'
	ctx.translate(0, DEFAULTS.yAxis.margin)
	ctx.beginPath()
	// xAxis labels (dynamic)
	let c = 0
	for (var i = showArea.from; i < showArea.to; i++) {
		ctx.fillText(t2d(showDates[i]), rowWidth*c, CANVAS.height - DEFAULTS.xAxis.padding)
		c++
	}
	ctx.stroke()
	
	ctx.translate(0, -DEFAULTS.yAxis.margin)
}

var drawPlotLines = function() {
	let canvasFullWidth = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale*showDates.length	// del
	let rowCount = DEFAULTS.yAxis.labels
	// let colCount = showDates.length
	let rowHeight = DEFAULTS.rowHeight
	let rowWidth  = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
	ctx.lineWidth = 0.5
	ctx.strokeStyle = DEFAULTS.xAxis.color
	ctx.beginPath()
	// yAxis lines
	for (var i = 0; i < rowCount; i++) {
		ctx.moveTo(0, CANVAS.height - rowHeight * i)								// 1
		// ctx.lineTo(CANVAS.width, CANVAS.height - rowHeight * i)			// 2
		ctx.lineTo(canvasFullWidth, CANVAS.height - rowHeight * i)			// 2
	}
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = '#E9E9E9E9'
	// xAxis lines
	let c = 0
	for (var i = showArea.from; i < showArea.to; i++) {
		// because need to think like the bottom left origin
		ctx.moveTo(rowWidth*c, CANVAS.height)										// 2
		ctx.lineTo(rowWidth*c, 0)																// 1
		c++
	}
	ctx.stroke()
}

var drawChartLines = function() {
	ctx.lineWidth = 2.5
	ctx.lineJoin = DEFAULTS.lineJoin
	let rowWidth  = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
	Object.entries(showLines).forEach(([key,line]) => {
		
		ctx.strokeStyle = line.color
		ctx.beginPath()
		let c = 0	//
		for (var i = showArea.from; i < showArea.to; i++) {
			ctx.lineTo(rowWidth*c, yrv(line.y[i]))
			c++
		}
		ctx.stroke()

		let d = 0
		for (var i = showArea.from; i < showArea.to; i++) {
			ctx.beginPath()
			ctx.arc(rowWidth*d, yrv(line.y[i]), 5, 0, 2 * Math.PI)
			ctx.clearRect(rowWidth*d-5,yrv(line.y[i])-5,5*2,5*2)
			ctx.stroke()
			d++
		}

	})
}
var redrawChartLines = function() {
	let step = allDates.length/MAPLAY.getBoundingClientRect().width
	// int required!!1
	showArea.from = parseInt(MAPSEL.offsetLeft*step)
	showArea.to = parseInt((MAPSEL.offsetLeft+MAPSEL.getBoundingClientRect().width)*step)
	DEFAULTS.xAxis.scale = (CANVAS.width/(showArea.to-showArea.from))/DEFAULTS.rowWidth
	let canvasFullWidth = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale*showDates.length
	const SELECTOR = MAPSEL.getBoundingClientRect()
	// render after mouseup (well, at least here the optimization was delivered)
	ctx.translate(0, DEFAULTS.yAxis.margin)
	ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)
	lastClientX = SELECTOR.x
	drawAxisLables()
	drawPlotLines()
	drawChartLines()
}

var pluginScrolling = function() {
	let step = showDates.length/MAPLAY.getBoundingClientRect().width
	// int required!!1
	showArea.from = parseInt(MAPSEL.offsetLeft*step)
	showArea.to = parseInt((MAPSEL.offsetLeft+MAPSEL.getBoundingClientRect().width)*step)
	DEFAULTS.xAxis.scale = (CANVAS.width/(showArea.to-showArea.from))/DEFAULTS.rowWidth

	// selector moves around the map only xAxis
	let innerLeftOffset = 0
	lastClientX = MAPSEL.getBoundingClientRect().x
	MAPSEL.addEventListener('mousedown', mouseDown, false)
	window.addEventListener('mouseup', mouseUp, false)
	
	function mouseUp(e) {
		redrawChartLines()
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
		if(offsetByParent>=0&&offsetByParent<=(LAYOUT.width-SELECTOR.width)) {
			MAPSEL.style.left = n2w(e.clientX + innerLeftOffset)
		}
		// resize??
	}
}

var drawMapLines = function() {
	mtx.lineWidth = 1.5
	mtx.lineJoin = DEFAULTS.lineJoin
	Object.entries(showLines).forEach(([key,line]) => {
		
		mtx.strokeStyle = line.color
		mtx.beginPath()
		line.x.forEach((dot,i) => {
			let y = MAPLAY.height-line.y[i]*DEFAULTS.yAxis.scale*(MAPLAY.height/(DEFAULTS.yAxis.globalmax*DEFAULTS.yAxis.scale));
			let rowWidth = MAPLAY.width/showDates.length;
			mtx.lineTo(rowWidth*i, y);
		})
		mtx.stroke()
		mtx.fillStyle = 'rgba(137, 162, 165, 0.05)'
		mtx.fillRect(0, 0, 400, 60);

	})
}
var redrawMapLines = function() {	
	mtx.clearRect(0, 0, MAPLAY.width, MAPLAY.height)
	drawMapLines()
}

var drawMapSelector = function() {
	// mtx.lineWidth = 1.5
	// mtx.lineJoin = DEFAULTS.lineJoin
	// Object.entries(showLines).forEach(([key,line]) => {
		
	// 	mtx.strokeStyle = line.color
	// 	mtx.beginPath()
	// 	line.x.forEach((dot,i) => {
	// 		let y = MAPLAY.height-line.y[i]*DEFAULTS.yAxis.scale*(MAPLAY.height/(DEFAULTS.yAxis.globalmax*DEFAULTS.yAxis.scale));
	// 		let rowWidth = MAPLAY.width/showDates.length;
	// 		mtx.lineTo(rowWidth*i, y);
	// 	})
	// 	mtx.stroke()
	// 	mtx.fillStyle = 'rgba(137, 162, 165, 0.05)'
	// 	mtx.fillRect(0, 0, 400, 60);

	// })
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

parseBadStruct()
initSelectors()

pluginScrolling()
// pluginScaling()

drawAxisLables()
drawPlotLines()
drawChartLines()
drawMapLines()
