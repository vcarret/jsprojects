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

const gdp_points = [3178.182,3259.97075,3343.54675,3548.4085,3702.94325,3916.2795,4170.74975,4445.853,4567.78075,4792.31475,4942.067,4951.2615,5114.3245,5383.28175,5687.20675,5656.465,5644.843,5948.995,6224.0865,6568.60825,6776.58,6759.18075,6930.71025,6805.758,7117.72875,7632.81225,7951.074,8226.3915,8510.99,8866.49875,9192.134,9365.494,9355.35475,9684.89175,9951.5025,10352.43175,10630.3205,11031.34975,11521.93825,12038.283,12610.49125,13130.9865,13262.07925,13493.0645,13879.1285,14406.3825,14912.50875,15338.25675,15626.0295,16912.03775,17432.17,17730.5085,18144.10475,18687.786,19091.66225]

const cap_points = [14239.895,14711.917,15205.273,15759.578,16361.41,17023.688,17752.528,18530.992,19263.544,20015.188,20760.19,21404.616,22058.784,22805.318,23631.742,24335.552,24870.554,25504.854,26279.792,27203.124,28174.17,28983.3,29770.398,30400.94,31125.588,32101.15,33160.38,34217.176,35245.904,36263.696,37283.484,38223.836,38987.08,39793.464,40663.208,41620.812,42632.688,43758.388,44977.192,46345.16,47827.896,49368.264,50734.812,51925.832,53184,54572.832,56084.492,57575.292,58915.288,64124.208,65057.808,65974.06,66942.704,68007.352,69059.064]

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
				Iy: 0.4396,
				Ik: -0.07681,
				Iky: -0.000001284,
				bari: -269.1,
				Syk: 0.000006668,
				Sy: 0.4783,
				Sy2: -0.00007747,
				Sy3: 0.000000001812,
				bars: -783.2,
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
					z: [-23.8847304737416,-27.657961784674,-32.509745956017,8.44408778451722,24.1611061556636,59.2600702938306,105.675002804449,156.099157690017,146.233205482135,177.023660962059,177.054152958424,127.256791279319,139.913975322833,188.0255150163,243.215655660943,171.464831354339,121.748944153368,192.172088636722,238.374517518974,299.488585602918,300.611958874912,224.422880883101,225.981115508422,121.889601589665,184.567612585052,305.912351995932,340.525536829419,357.494939833814,379.839155180348,430.264204074039,467.881292398806,452.253573406504,380.502387187525,436.900297433722,462.558629711746,531.586412738519,547.359058419872,599.28448497731,675.729360207589,746.670264524894,826.258014188836,878.810644334507,799.894262855408,774.269319020407,799.17699357602,862.579159763333,904.545429861747,917.171289958761,892.588546593802,847.410666634712,940.621131763736,955.608580884479,1005.41541212054,1090.35572271342,1126.06354690672],// I
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
					z: [314.301505591039,335.258881174513,356.625953630718,392.338156119512,421.578246175577,455.088769512075,489.145005963424,520.485614080608,544.498569026444,568.666097620044,591.176269268053,612.297600739277,631.164667755694,647.709473741752,660.593622080186,689.232221357924,710.083011599612,713.534027664317,720.022445752436,720.802254556247,737.190621342235,775.980605178815,789.309427764834,834.289752407265,826.815079448071,793.465960426725,790.770850588922,794.162046466532,792.914528033343,773.968160640038,759.706795744677,776.336862062485,826.39085353535,798.011454180952,788.102111007864,748.648616221836,744.943583778217,716.298472433396,669.695081233413,628.402801029772,583.419270932492,563.977861365418,646.722104188438,688.417350079879,697.593871646355,688.088877049372,706.316612387186,753.336312509741,825.699263170735,941.428841923141,1081.60382271804,1054.29808563347,1069.48694750333,1081.46801410573,1113.76272420974,1142.81349933655,1172.360007424,1241.36733186544,1312.20699917776,1398.58856687906,1510.08924895993],// S
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
					z: [56.089,54.581,55.87675,65.477,69.7055,76.1545,89.5025,102.446,96.8115,102.808,108.212,93.01525,106.40675,127.825,153.8825,143.7985,103.14575,152.6435,199.94525,256.74875,285.866,237.61825,291.33925,201.014,246.0585,414.8765,409.3895,401.93975,416.43125,410.86675,431.87625,395.286,306.045,348.879,395.20875,495.0495,502.79625,576.70725,682.8795,770.93575,856.60125,916.03075,747.216,716.119,772.19625,945.63175,1076.9835,1127.725,1012.22625,831.71925,948.37775,840.169,902.5905,1071.734,1083.1045],
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
					z: [328.333166416667,328.191684333333,377.495388833333,397.31200225,397.476432083333,454.06961825,477.334254166667,496.172687916667,563.01613325,542.879369833333,538.7908835,633.81933625,689.126088083333,665.164604583333,765.138458666667,752.29950725,756.505251666667,691.4088115,663.7395585,704.027154166667,698.969098083333,747.205474666667,812.060551916667,819.546171333333,714.767767916667,864.554507833333,728.402636666667,725.642226083333,673.09172975,751.488687,769.647162333333,783.623940666667,823.364382083333,914.860136833333,788.153071916667,715.282447416667,743.001628,723.365879166667,729.670306416667,817.788706666667,634.842668083333,631.240888166667,665.166039,786.989761666667,767.970008666667,737.104733,459.705118583333,582.759802583333,571.382121833333,776.771893833333,928.715008416667,1022.1375745,1131.24562041667,1429.59577025,1054.34478233333,1243.28740841667,1314.46157208333,1220.18436,1303.35913075,1465.56033625,1439.44016691667],
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