import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-gl3d-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
import {InlineMath} from 'react-katex';

var odex = require('odex');// see https://github.com/littleredcomputer/odex-js
var s = new odex.Solver(2);

var KaldorCS = function(Iy,Ik,Iky,bari,Syk,Sy,Sy2,Sy3,bars,delta,alpha) {
  return function(x, y) {
	let inv = Inv(y[0],y[1],Iy,Ik,Iky,bari)
	return [
	  // alpha*(-0.00000000153*y[0]**3+0.00004744*y[0]**2+(Iy-0.4719)*y[0]-Ik*y[1]+(bari+748.1)),
	  alpha*(inv-Sav(y[0],y[1],Syk,Sy,Sy2,Sy3,bars)),
	  inv - delta*y[1]
	];
  };
};

const Plot = createPlotlyComponent(Plotly);

const steps = {
	maxgdp: 100,
	maxcap: 100,
	tfinal: 5,
	alpha: 0.05,
	Iy: 0.01,
	Ik: 0.001,
	Iky: 0.0000001,
	bari: 25,
	Syk: 0.0000001,
	Sy: 0.01,
	Sy2: 0.000001,
	Sy3: 0.0000000001,
	bars: 1,
	delta: 0.01,
	Y0: 100,
	K0: 500
}

function Inv(Y,K,Iy,Ik,Iky,bari){
	return(Iy*Y + Iky*(Y*K) + Ik*K + bari)
}

function Sav(Y,K,Syk,Sy,Sy2,Sy3,bars){
	return(Syk*Y*K+Sy3*Y**3+Sy2*Y**2+Sy*Y+bars)
}

function locus_ydot(Y,Iy,Ik,Iky,bari,Syk,Sy,Sy2,Sy3,bars){
	return((bari-bars+(Iy-Sy)*Y-Sy3*Y**3-Sy2*Y**2)/((Syk-Iky)*Y-Ik))
}

const gdp_points = [3178.182,3259.97075,3343.54675,3548.4085,3702.94325,3916.2795,4170.74975,4445.853,4567.78075,4792.31475,4942.067,4951.2615,5114.3245,5383.28175,5687.20675,5656.465,5644.843,5948.995,6224.0865,6568.60825,6776.58,6759.18075,6930.71025,6805.758,7117.72875,7632.81225,7951.074,8226.3915,8510.99,8866.49875,9192.134,9365.494,9355.35475,9684.89175,9951.5025,10352.43175,10630.3205,11031.34975,11521.93825,12038.283,12610.49125,13130.9865,13262.07925,13493.0645,13879.1285,14406.3825,14912.50875,15338.25675,15626.0295,15604.6875,16197.0075,16495.3695,16912.03775,17432.17,17730.5085,18144.10475,18687.786,19091.66225]

const cap_points = [14239.895,14711.917,15205.273,15759.578,16361.41,17023.688,17752.528,18530.992,19263.544,20015.188,20760.19,21404.616,22058.784,22805.318,23631.742,24335.552,24870.554,25504.854,26279.792,27203.124,28174.17,28983.3,29770.398,30400.94,31125.588,32101.15,33160.38,34217.176,35245.904,36263.696,37283.484,38223.836,38987.08,39793.464,40663.208,41620.812,42632.688,43758.388,44977.192,46345.16,47827.896,49368.264,50734.812,51925.832,53184,54572.832,56084.492,57575.292,58915.288,59981.816,62435.628,63232.936,64124.208,65057.808,65974.06,66942.704,68007.352,69059.064]

const btn_choices = ["is3d","is","phase","traj"]

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			params: {
				maxgdp: 35000,
				maxcap: 70000,
				tfinal: 100,
				alpha: 0.1,
				Iy: 0.4729,
				Ik: -0.08407,
				Iky: -0.000001394,
				bari: -266.6,
				Syk: 0.000008126,
				Sy: 0.4602,
				Sy2: -0.00008185,
				Sy3: 0.000000001805,
				bars: -742.4,
				delta: 0.02,
				Y0: 16495,
				K0: 63232
			},
			graph_sel: {
				value: "is3d",
				is3d_sel: "sel",
				is_sel: "",
				phase_sel: "",
				traj_sel: "" 
			},
			data_is3d: [
				{
					x: gdp_points,
					y: cap_points,
					z: [-23.891,-28.666,-34.634,8.56,24.541,61.268,110.056,163.074,151.332,183.271,182.144,127.599,140.185,190.74,248.774,170.526,116.234,190.937,239.374,303.597,303.248,220.052,220.46,107.56,173.758,302.596,338.068,354.572,376.891,429.396,468.124,449.76,371.382,430.63,456.733,529.279,544.503,598.366,678.396,752.236,835.143,888.883,801.699,772.059,796.562,862.156,904.484,915.322,886.464,765.255,734.13,763.89,828.26,926.559,940.907,992.521,1081.649,1117.941],// I fitted
					type: 'scatter3d',
					mode: 'lines',
					name: 'Investment',
					line: {
						width: 10,
						color: 'green'
					},
					opacity: 0.7,
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<br>I: %{z:.0f}' +
						'<extra></extra>'
				},
				{
					x: gdp_points,
					y: cap_points,
					z: [319.246,340.348,361.971,395.166,423.471,454.824,485.944,514.006,539.131,561.504,584.597,610.081,628.704,642.392,651.83,687.317,712.953,711.798,715.714,712.734,730.872,778.286,793.276,848.984,837.898,795.64,792.262,796.798,796.11,774.567,759.015,780.386,841.322,809.018,798.927,753.955,751.612,719.741,666.302,618.79,565.821,542.29,642.903,693.019,702.12,685.626,700.583,749.619,831,972.585,1126.034,1154.879,1173.381,1184.416,1252.131,1313.114,1380.145,1483.798],// S fitted
					type: 'scatter3d',
					mode: 'lines',
					name: 'Savings',
					line: {
						width: 10,
						color: 'red'
					},
					opacity: 0.7,
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<br>S: %{z:.0f}' +
						'<extra></extra>'
				},
				{
					x: gdp_points,
					y: cap_points,
					z: [56.089,54.581,55.87675,65.477,69.7055,76.1545,89.5025,102.446,96.8115,102.808,108.212,93.01525,106.40675,127.825,153.8825,143.7985,103.14575,152.6435,199.94525,256.74875,285.866,237.61825,291.33925,201.014,246.0585,414.8765,409.3895,401.93975,416.43125,410.86675,431.87625,395.286,306.045,348.879,395.20875,495.0495,502.79625,576.70725,682.8795,770.93575,856.60125,916.03075,747.216,716.119,772.19625,945.63175,1076.9835,1127.725,1012.22625,748.36675,666.788,745.19775,831.71925,948.37775,840.169,902.5905,1071.734,1083.1045], // I real
					mode: 'markers',
					marker: {
						size: 5,
						line: {
							color: 'rgba(25, 25, 25, 25)',
							width: 0.5
						},
						opacity: 0.8},
					type: 'scatter3d',
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<br>I: %{z:.0f}' +
						'<extra></extra>'
				},
				{
					x: gdp_points,
					y: cap_points,
					z: [328.333,328.192,377.495,397.312,397.476,454.07,477.334,496.173,563.016,542.879,538.791,633.819,689.126,665.165,765.138,752.3,756.505,691.409,663.74,704.027,698.969,747.205,812.061,819.546,714.768,864.555,728.403,725.642,673.092,751.489,769.647,783.624,823.364,914.86,788.153,715.282,743.002,723.366,729.67,817.789,634.843,631.241,665.166,786.99,767.97,737.105,459.705,582.76,571.382,776.772,1429.596,1054.345,1243.287,1314.462,1220.184,1303.359,1465.56,1439.44], // S real
					mode: 'markers',
					marker: {
						size: 5,
						line: {
							color: 'rgba(25, 25, 25, 25)',
							width: 0.5
						},
						opacity: 0.8
					},
					type: 'scatter3d',
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<br>S: %{z:.0f}' +
						'<extra></extra>'
				},
				{
					x: [],
					y: [],
					z: [],
					type: 'scatter3d',
					mode: 'lines',
					name: 'Investment',
					line: {
						width: 5,
						color: 'rgba(35, 79, 35, 25)',
					},
					opacity: 0.7,
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<br>I: %{z:.0f}' +
						'<extra></extra>'
				},
				{
					x: [],
					y: [],
					z: [],
					type: 'scatter3d',
					mode: 'lines',
					name: 'Savings',
					line: {
						width: 5,
						color: 'rgba(142, 0, 0, 25)',
					},
					opacity: 0.7,
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<br>S: %{z:.0f}' +
						'<extra></extra>'
				},
				{
					x: [],
					y: [],
					z: [],
					mode: 'markers',
					marker: {
						size: 5,
						line: {
							color: 'rgba(217, 217, 217, 0.14)',
							width: 0.2
						},
						opacity: 0.8
					},
					type: 'scatter3d',
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<br>S: %{z:.0f}' +
						'<extra></extra>'
				}
			],
			data_is: [
				{
					x: [],
					y: [],// I
					type: 'scatter',
					mode: 'lines',
					name: "Investment",
					line: {
						color: "black"
					},
					showlegend: false
				},
				{
					x: [],
					y: [],// S
					type: 'scatter',
					mode: 'lines',
					name: "Savings",
					line: {
						color: "red"
					},
					showlegend: false
				}
			],
			data_phase: [
				{
					x: [],
					y: [], // y-y
					type: 'scatter',
					mode: 'lines',
					line: {
						color: "blue"
					},					
					name: "Constant income locus",
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<extra></extra>'
				},
				{
					x: [],
					y: [],// k-k
					type: 'scatter',
					mode: 'lines',
					name: 'Constant capital locus',
					line: {
						color: "green"
					},
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<extra></extra>'
				},
				{
					x: [],
					y: [],// trajectory
					type: 'scatter',
					mode: 'lines',
					name: 'Trajectory',
					line: {
						color: "black"
					},
					showlegend: false,
					hovertemplate: 
						'Y: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<extra></extra>'
				}
			],
			data_traj: [
				{
					x: [],
					y: [],// I
					type: 'scatter',
					mode: 'lines',
					name: "Income",
					line: {
						color: "black"
					},
					showlegend: false,
					hovertemplate: 
						't: %{x:.0f}' +
						'<br>Y: %{y:.0f}' +
						'<extra></extra>'
				},
				{
					x: [],
					y: [],// S
					type: 'scatter',
					mode: 'lines',
					name: 'Capital',
					line: {
						color: "red"
					},
					showlegend: false,
					hovertemplate: 
						't: %{x:.0f}' +
						'<br>K: %{y:.0f}' +
						'<extra></extra>'
				}
			],
			layout_is3d: {
				autosize: true,
				hovermode: 'closest',
				showlegend: false,
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
				//plot_bgcolor: '#cccccc',
				// domain: {
				// 	x: [0.00,  0.33], 
				// 	y: [0.5, 1]
				// },
				scene: {
					xaxis:{title: 'Income, Y'},
					yaxis:{title: 'Capital, K'},
					zaxis:{title: 'Investment (I), Savings (S)'},
					camera: {
						center: {
							x: -0.05, y: -0.08, z: -0.2 
						}, 
						eye: { 
							x: 1.15, y: -1.45, z: 0.25 
						}, 
						up: {
							x: 0, y: 0, z: 1 
						}
					}
				}
			},
			layout_is: {
				autosize: true,
				showlegend: true,
				hovermode: 'closest',
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
				//plot_bgcolor: '#cccccc',
				yaxis: {
					title: "Investment (I), Savings (S)",
					titlefont: {
						family: 'Arial, sans-serif',
						size: 18,
						color: '#333'
					},
					// autorange: true,
					range: []
				},
				xaxis: {
					title: 'Income (Y)',
					titlefont: {
						family: 'Arial, sans-serif',
						size: 18,
						color: '#333'
					},
				autorange: true,
				// range: []
				}
			},
			layout_phase: {
				autosize: true,
				showlegend: false,
				hovermode: 'closest',
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
				//plot_bgcolor: '#cccccc',
				yaxis: {
					autorange: true,
					title: "Capital stock, K",
					titlefont: {
						family: 'Arial, sans-serif',
						size: 18,
						color: '#333'
					},
					range: []
				},
				xaxis: {
					title: 'Income, Y',
					titlefont: {
						family: 'Arial, sans-serif',
						size: 18,
						color: '#333'
					},
					autorange: true
				}
			},
			layout_traj: {
				autosize: true,
				showlegend: false,
				hovermode: 'closest',
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
				//plot_bgcolor: '#cccccc',
				yaxis: {
					title: '',
					titlefont: {
						family: 'Arial, sans-serif',
						size: 18,
						color: '#333'
					},
					autorange: true
				},
				xaxis: {
					title: 'Time, t',
					titlefont: {
						family: 'Arial, sans-serif',
						size: 18,
						color: '#333'
					},
					autorange: true
				}
			}
		};

		this.handleChange = this.handleChange.bind(this);
		this.computeEquilibrium = this.computeEquilibrium.bind(this);
		this.handleGraph = this.handleGraph.bind(this);
	}

	componentDidMount() {
		this.computeEquilibrium(this.state.params);
	}

	handleGraph(event) {
		if(event.target.name !== this.state.graph_sel){
			var graph_sel = {
				value: event.target.name
			}
			graph_sel[event.target.name+"_sel"] = "sel"
			graph_sel[btn_choices[(btn_choices.indexOf(event.target.name)+1)%2]+"_sel"] = ""
			this.setState({
				graph_sel
			}, function() {
				this.computeEquilibrium(this.state.params);
			})
		}
	}

	handleChange(event) {
		let partialState = Object.assign({}, this.state);

		partialState.params[event.target.name] = parseFloat(event.target.value);
		this.setState(partialState, function() {
			this.computeEquilibrium();
		});
	}

	computeEquilibrium() {
		var params = this.state.params;
		// console.log(this.state.layout_is3d) // To find best camera angles

		let income = [];
		let capital = [];
		let time = [];

		s.denseOutput = true;  // request interpolation closure in solution callback

		s.solve(KaldorCS(params.Iy,params.Ik,params.Iky,params.bari,params.Syk,params.Sy,params.Sy2,params.Sy3,params.bars,params.delta,params.alpha),
			0,    // initial x value
			[params.Y0,params.K0],  // initial y values (just one in this example)
			params.tfinal, // final x value
			s.grid(0.5, function(x,y) {
				// console.log(x,y)
					time.push(x);
					income.push(y[0]);
					capital.push(y[1]);
			}));  

		if(this.state.graph_sel.value === 'is3d'){
			let inv = [];
			let sav = [];
			for(let i = 0; i <= time.length; i++){
				inv.push(Inv(income[i],capital[i],params.Iy,params.Ik,params.Iky,params.bari));
				sav.push(Sav(income[i],capital[i],params.Syk,params.Sy,params.Sy2,params.Sy3,params.bars));
			}

			let partialState = Object.assign({}, this.state);
			partialState.data_is3d[4].x = income;
			partialState.data_is3d[4].y = capital;
			partialState.data_is3d[4].z = inv;

			partialState.data_is3d[5].x = income;
			partialState.data_is3d[5].y = capital;
			partialState.data_is3d[5].z = sav;

			partialState.data_is3d[6].x = [params.Y0,params.Y0];
			partialState.data_is3d[6].y = [params.K0,params.K0];
			partialState.data_is3d[6].z = [inv[0],sav[0]];

			// See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
			const newLayout = Object.assign({}, this.state.layout_is3d);
			newLayout.datarevision = (partialState.layout_is3d.datarevision + 1) % 10;
			this.setState({
				data_is3d: partialState.data_is3d,
				layout_is3d: newLayout
			})

		} else if(this.state.graph_sel.value === 'is'){
			let gdp = [];
			let inv = [];
			let sav = [];
			for(let i = 0; i <= params.maxgdp; i += 50){
				gdp.push(i);
				inv.push(Inv(i,params.K0,params.Iy,params.Ik,params.Iky,params.bari));
				sav.push(Sav(i,params.K0,params.Syk,params.Sy,params.Sy2,params.Sy3,params.bars));
			}

			let partialState = Object.assign({}, this.state);
			partialState.data_is[0].x = gdp;
			partialState.data_is[0].y = inv;

			partialState.data_is[1].x = gdp;
			partialState.data_is[1].y = sav;

			// See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
			const newLayout = Object.assign({}, this.state.layout_is);
			newLayout.yaxis.range = [0,sav[sav.length-1]];
			newLayout.datarevision = (partialState.layout_is.datarevision + 1) % 10;
			this.setState({
				data_is: partialState.data_is,
				layout_is: newLayout
			})
			// console.log(this.state)			
		} else if(this.state.graph_sel.value === 'phase'){
			let gdp = [];
			let cap_locus = [];
			let inc_locus = [];
			let step = 100
			for(let i = -5000 ; i < params.maxgdp ; i += step){
				gdp.push(i)
				cap_locus.push((params.bari+params.Iy*i)/(params.delta-params.Iky*i-params.Ik))
				inc_locus.push(locus_ydot(i,params.Iy,params.Ik,params.Iky,params.bari,params.Syk,params.Sy,params.Sy2,params.Sy3,params.bars))
			}

			let partialState = Object.assign({}, this.state);
			// if(draw === "normal"){
			partialState.data_phase[0].x = gdp;
			partialState.data_phase[0].y = inc_locus;
			
			partialState.data_phase[1].x = gdp;
			partialState.data_phase[1].y = cap_locus;

			partialState.data_phase[2].x = income;
			partialState.data_phase[2].y = capital;
			// } 
			// else if(draw.includes("shock")){
			// 	let n_shock = parseFloat(draw.charAt(draw.length-2))
			// 	partialState.data_phase[n_shock].x = income;
			// 	partialState.data_phase[n_shock].y = capital;
			// 	partialState.data_phase[n_shock].z = grid;
			// }			

			const newLayout = Object.assign({}, this.state.layout_phase);
			newLayout.yaxis.range = [0,params.maxcap];
			newLayout.datarevision = (partialState.layout_phase.datarevision + 1) % 10;

			this.setState({
				data_phase: partialState.data_phase,
				layout_phase: newLayout
			})
		} else if(this.state.graph_sel.value === 'traj'){
			let partialState = Object.assign({}, this.state);
			partialState.data_traj[0].x = time;
			partialState.data_traj[0].y = income;

			partialState.data_traj[1].x = time;
			partialState.data_traj[1].y = capital;

			// See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
			const newLayout = Object.assign({}, this.state.layout_traj);
			newLayout.datarevision = (partialState.layout_traj.datarevision + 1) % 10;
			this.setState({
				data_traj: partialState.data_traj,
				layout_traj: newLayout
			})
		}
	}

	render() {
		return (
			<div id = "page-wrapper">
				<h1>Kaldor (1940)</h1>
				<div className="row">
					<div className="block-2">
						<div id="settings">
							<h4><u>Global parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
										<label>
										  Max(GDP)
										  <input name="maxgdp" value={this.state.params.maxgdp} step={steps.maxgdp} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  Max(capital)
										  <input name="maxcap" value={this.state.params.maxcap} step={steps.maxcap} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
										<label>
										  Final time
										  <input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="\alpha" />
										  <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
							</div>
							<h4><u>Investment parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="I_y" />
										  <input name="Iy" value={this.state.params.Iy} step={steps.Iy} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="I_k" />
										  <input name="Ik" value={this.state.params.Ik} step={steps.Ik} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="\bar{I}" />
										  <input name="bari" value={this.state.params.bari} step={steps.bari} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="\delta" />
										  <input name="delta" value={this.state.params.delta} step={steps.delta} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="I_{ky}" />
										  <input name="Iky" value={this.state.params.Iky} step={steps.Iky} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
							</div>
							<h4><u>Savings parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="S_y" />
										  <input name="Sy" value={this.state.params.Sy} step={steps.Sy} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="S_{y2}" />
										  <input name="Sy2" value={this.state.params.Sy2} step={steps.Sy2} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="S_{y3}" />
										  <input name="Sy3" value={this.state.params.Sy3} step={steps.Sy3} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="S_{yk}" />
										  <input name="Syk" value={this.state.params.Syk} step={steps.Syk} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="\bar{S}" />
										  <input name="bars" value={this.state.params.bars} step={steps.bars} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
							</div>
							<h4><u>Initial Conditions</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="Y(0)" />
										  <input name="Y0" value={this.state.params.Y0} step={steps.Y0} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
								<div className="block-4">
									<div className="entry">
										<label>
										  <InlineMath math="K(0)" />
										  <input name="K0" value={this.state.params.K0} step={steps.K0} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="block-10">
						<div id="graph_selector" className="row">
							<div className="block-2">
								<button id="is3d_btn" className={"btn " + this.state.graph_sel.is3d_sel} name="is3d" onClick={this.handleGraph}>I&S in 3D</button>
							</div>
							<div className="block-2">
								<button id="is_btn" className={"btn " + this.state.graph_sel.is_sel} name="is" onClick={this.handleGraph}>I&S</button>
							</div>
							<div className="block-2">
								<button id="phase_btn" className={"btn " + this.state.graph_sel.phase_sel} name="phase" onClick={this.handleGraph}>Phase diagram</button>
							</div>
							<div className="block-2">
								<button id="traj_btn" className={"btn " + this.state.graph_sel.traj_sel} name="traj" onClick={this.handleGraph}>Trajectories</button>
							</div>
						</div>
						<div id="model">
							<Plot
								data={this.state["data_"+this.state.graph_sel.value]}
								layout={this.state["layout_"+this.state.graph_sel.value]}
								style={{width: "100%", height: "100%"}}
								useResizeHandler={true}
								/>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

ReactDOM.render(
  <App />,
  document.getElementById('root-kaldor_1940')
);