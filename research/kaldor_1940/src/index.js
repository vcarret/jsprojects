import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-cartesian-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
import {InlineMath} from 'react-katex';

var odex = require('odex');
var s = new odex.Solver(2);

var KaldorCS = function(Iy,Ik,bari,alpha) {
  return function(x, y) {
    return [
      alpha*(-0.00000000153*y[0]**3+0.00004744*y[0]**2+(Iy-0.4719)*y[0]-Ik*y[1]+(bari+748.1)),
      Iy * y[0] - Ik*y[1] + bari
    ];
  };
};

const Plot = createPlotlyComponent(Plotly);

const steps = {
	maxgdp: 100,
	maxcap: 100,
	tfinal: 5,
	alpha: 0.5,
	Iy: 0.01,
	Ik: 0.01,
	bari: 25,
	Y0: 100,
	K0: 500
}

function Inv(Y,K,Iy,Ik,bari){
	return(Iy*Y+Ik*K+bari)
}

function Sav(Y){
  	return(0.00000000153*Y**3-0.00004744*Y**2+0.4719*Y-748.1)
}

function locus_ydot(Y,Iy,Ik,bari){
  	return(1/Ik*(-0.00000000153*Y**3+0.00004744*Y**2+(Iy-0.4719)*Y+(bari+748.1)))
}

const btn_choices = ["is","phase","traj"]

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
		    params: {
		    	maxgdp: 30000,
		    	maxcap: 70000,
			    tfinal: 30,
				alpha: 1,
				Iy: 0.14,
				Ik: -0.02,
				bari: -125,
				Y0: 20000,
				K0: 70000
	    	},
	    	graph_sel: {
	    		value: "is",
	    		is_sel: "sel",
	    		phase_sel: "",
	    		traj_sel: "" 
	    	},
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
		            showlegend: false,
		            hovertemplate: 
		            	'gdp: %{x:.0f}' +
                        '<br>I: %{y:.0f}' +
                        '<extra></extra>'
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
		            showlegend: false,
		            hovertemplate: 
		            	'gdp: %{x:.0f}' +
                        '<br>S: %{y:.0f}' +
                        '<extra></extra>'
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
  		// 		plot_bgcolor: '#cccccc',
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
  		// 		plot_bgcolor: '#cccccc',
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
  		// 		plot_bgcolor: '#cccccc',
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

		let income = [];
		let capital = [];
		let time = [];

		s.denseOutput = true;  // request interpolation closure in solution callback

		s.solve(KaldorCS(params.Iy,params.Ik,params.bari,params.alpha),
			0,    // initial x value
			[params.Y0,params.K0],  // initial y values (just one in this example)
			params.tfinal, // final x value
			s.grid(1, function(x,y) {
				// console.log(x,y)
					time.push(x);
					income.push(y[0]);
					capital.push(y[1]);
			}));  

		if(this.state.graph_sel.value === 'is'){
			let gdp = [];
			let inv = [];
			let sav = [];
			for(let i = 0; i <= params.maxgdp; i += 50){
				gdp.push(i);
				inv.push(Inv(i,params.K0,params.Iy,params.Ik,params.bari));
				sav.push(Sav(i));
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
			for(let i = 0 ; i < params.maxgdp ; i += step){
			    gdp.push(i)
			    cap_locus.push(-params.Iy/params.Ik*i-params.bari/params.Ik)
			    inc_locus.push(locus_ydot(i,params.Iy,params.Ik,params.bari))
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
								<div className="block-4">
									<div className="entry">
								        <label>
								          Final time
								          <input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
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
								          <InlineMath math="\alpha" />
								          <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
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