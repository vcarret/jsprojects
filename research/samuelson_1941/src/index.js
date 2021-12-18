import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	tfinal: 5,
	maxY: 10,
	alpha: 5,
	alpha2: 5,
	Cy: 0.01,
	Ci: 0.01,
	beta: 5,
	Fy: 0.01,
	Fi: 1,
	Ly: 0.01,
	Li: 1,
	M: 5
}

const btn_choices = ["islm","traj"]

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 30,
				maxY: 3000,
				alpha: 150,
				alpha2: 250,
				Cy: 0.7,
				Ci: 0,
				beta: 50,
				Fy: 0.2,
				Fi: -25,
				Ly: 0.5,
				Li: -100,
				M: 200
	    	},
	    	delta: null,
	    	graph_sel: {
	    		value: "islm",
	    		islm_sel: "sel",
	    		traj_sel: ""
	    	},
		    islm_data: [
	    		{
	    			x: [],// Income
		            y: [],// Interest rate
		            type: 'scatter',
		            mode: 'lines',
		            name: "IS",
		            line: {
		            	color: "red"
		            },
		            hovertemplate:
		            	'Y: %{x:.2f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],// Income
		            y: [],// Interest rate
		            type: 'scatter',
		            mode: 'lines',
		            name: "LM",
		            line: {
		            	color: "blue"
		            },
		            hovertemplate:
		            	'Y: %{x:.2f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {// Eq. 1
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.0f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {// Eq. 1
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.0f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],// Income
		            y: [],// Interest rate
		            type: 'scatter',
		            mode: 'lines',
		            name: "IS 2",
		            line: {
		            	color: "darkred"
		            },
		            hovertemplate:
		            	'Y: %{x:.2f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {// Eq. 2
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.0f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {// Eq. 2
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.0f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
					y: [],
					mode: 'lines',
					name: 'Trajectory',
					line: {
						dash: 'dashdot',
						width: 4
					},
		            hovertemplate: 
		            	'Y: %{x:.0f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
	    	traj_data: [
	    		{
	    			x: [],
		            y: [],// Income
		            type: 'scatter',
		            mode: 'lines',
		            name: "Income",
		            line: {
		            	color: "black"
		            },
		            showlegend: true,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>Y: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],
		            y: [],// Interest rate
		            type: 'scatter',
		            mode: 'lines',
		            name: "Interest rate",
		            line: {
		            	color: "red"
		            },
		            showlegend: true,
                    yaxis: 'y2',
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>i: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],
		            y: [],// Investment
		            type: 'scatter',
		            mode: 'lines',
		            name: "Investment",
		            line: {
		            	color: "blue"
		            },
		            showlegend: true,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>I: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
		    islm_layout: {
				autosize: true,
				showlegend: true,
				legend: {
					x: 1,
					xanchor: 'right',
					y: 1
				},
				hovermode: 'closest',
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
				yaxis: {
					title: "Interest rate",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    autorange: true
				},
				xaxis: {
					title: 'Income',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					autorange: true
				}
			},
			traj_layout: {
				autosize: true,
				showlegend: true,
				legend: {
					x: 1,
					xanchor: 'right',
					y: 0.5
				},
				hovermode: 'closest',
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
  				// plot_bgcolor: '#cccccc',
				yaxis: {
					title: "Income, Y(t) and Investment I(t)",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    range: []
				},
				yaxis2: {
					title: "Interest rate i(t)",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    overlaying: 'y',
    				side: 'right',
    				range: []
				},
				xaxis: {
					title: 'Time, t',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: []
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

		var IS_curve = []
		var LM_curve = []
		var ISLM_income = []
		var IS_curve2 = []

		for(let y = 0; y <= params.maxY; y++){
			ISLM_income.push(y)
			IS_curve.push(1/(params.Ci+params.Fi)*(-(params.beta+params.alpha)+(1-params.Cy-params.Fy)*y))
			LM_curve.push(1/params.Li*(params.M-params.Ly*y))
			if(params.alpha2){
				IS_curve2.push(1/(params.Ci+params.Fi)*(-(params.beta+params.alpha2)+(1-params.Cy-params.Fy)*y))
			}
		}

		var delta = params.Ly*(params.Ci+params.Fi) + params.Li*(1-params.Cy-params.Fy)
		this.setState({
			delta: delta
		})

		var eq1Y = (params.M*(params.Ci+params.Fi) + params.Li*(params.beta+params.alpha))/delta
		var eq1i = (-params.Ly*(params.beta+params.alpha) + params.M*(1-params.Cy-params.Fy))/delta
		
		var eq2Y = (params.M*(params.Ci+params.Fi) + params.Li*(params.beta+params.alpha2))/delta
		var eq2i = (-params.Ly*(params.alpha2+params.beta)+params.M*(1-params.Cy-params.Fy))/delta

		var lambda = -params.Ly/params.Li*(params.Fi+params.Ci)-(1-params.Cy-params.Fy)
		var C = (params.Fi+params.Ci)*params.M/params.Li+params.alpha2+params.beta

		var time = [];
		var income = [];
		var interest_rate = [];
		var investment = [];

        for(let t = 0; t <= params.tfinal ; t+= 0.1){
			time.push(t);
			income.push(-C/lambda + (eq1Y + C/lambda) * Math.exp(lambda*t))
            interest_rate.push((params.M-params.Ly*income[Math.round(t*10)])/params.Li)
			investment.push(params.Fi*interest_rate[Math.round(t*10)]+params.Fy*income[Math.round(t*10)]+params.beta)
        }

		if(this.state.graph_sel.value === 'islm'){
			let partialState = Object.assign({}, this.state);
			partialState.islm_data[0].x = ISLM_income;
			partialState.islm_data[0].y = IS_curve;

	        partialState.islm_data[1].x = ISLM_income;
	        partialState.islm_data[1].y = LM_curve;

	        if(eq1i > 0 & eq1Y > 0){
		        partialState.islm_data[2].x = [0,eq1Y];
		        partialState.islm_data[2].y = [eq1i,eq1i];

		        partialState.islm_data[3].x = [eq1Y,eq1Y];
		        partialState.islm_data[3].y = [0,eq1i];
			} else{
				partialState.islm_data[2].x = [];
		        partialState.islm_data[2].y = [];

		        partialState.islm_data[3].x = [];
		        partialState.islm_data[3].y = [];
			}

	        partialState.islm_data[4].x = ISLM_income;
	        partialState.islm_data[4].y = IS_curve2;

	        if(eq2i > 0 & eq2Y > 0){
		        partialState.islm_data[5].x = [0,eq2Y];
		        partialState.islm_data[5].y = [eq2i,eq2i];

		        partialState.islm_data[6].x = [eq2Y,eq2Y];
		        partialState.islm_data[6].y = [0,eq2i];
		    } else{
		    	partialState.islm_data[5].x = [];
		        partialState.islm_data[5].y = [];

		        partialState.islm_data[6].x = [];
		        partialState.islm_data[6].y = [];
		    }

		    partialState.islm_data[7].x = income;
	        partialState.islm_data[7].y = interest_rate;

	        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
	        const islm_newLayout = Object.assign({}, this.state.islm_layout);
	        islm_newLayout.datarevision = (partialState.islm_layout.datarevision + 1) % 10;
			this.setState({
				islm_data: partialState.islm_data,
				islm_layout: islm_newLayout
			})
		} else if(this.state.graph_sel.value === 'traj'){
			let partialState = Object.assign({}, this.state);
			partialState.traj_data[0].x = time;
			partialState.traj_data[0].y = income;

	        partialState.traj_data[1].x = time
	        partialState.traj_data[1].y = interest_rate

	        partialState.traj_data[2].x = time
	        partialState.traj_data[2].y = investment

	        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
	        const traj_newLayout = Object.assign({}, this.state.traj_layout);
	        traj_newLayout.datarevision = (partialState.traj_layout.datarevision + 1) % 10;
	        traj_newLayout.yaxis2.range = [0,1.1*Math.max.apply(null,interest_rate)]
			this.setState({
				traj_data: partialState.traj_data,
				traj_layout: traj_newLayout,
			})
		}
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>Samuelson (1941) - Stability of Equilibrium</h1>
				<div className="row">
				    <div className="block-2">
				    	<div id="settings">
				    		<h4><u>Global parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="t_{final}" />
								          <input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="Y_{max}" />
								          <input name="maxY" value={this.state.params.maxY} step={steps.maxY} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Consumption parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\alpha" />
								          <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="C_Y" />
								          <input name="Cy" value={this.state.params.Cy} step={steps.Cy} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="C_i" />
								          <input name="Ci" value={this.state.params.Ci} step={steps.Ci} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Investment parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\beta" />
								          <input name="beta" value={this.state.params.beta} step={steps.beta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="F_Y" />
								          <input name="Fy" value={this.state.params.Fy} step={steps.Fy} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="F_i" />
								          <input name="Fi" value={this.state.params.Fi} step={steps.Fi} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Liquitidy preference parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="L_Y" />
								          <input name="Ly" value={this.state.params.Ly} step={steps.Ly} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="L_i" />
								          <input name="Li" value={this.state.params.Li} step={steps.Li} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="M" />
								          <input name="M" value={this.state.params.M} step={steps.M} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Change in consumption</u></h4>
							<div className="row">						
								<div className="block-5">
									<div className="entry">
								        <label>
								          New <InlineMath math="\alpha" />
								          <input name="alpha2" value={this.state.params.alpha2} step={steps.alpha2} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>						
					    </div>
				    	<div id="equations">
				    		<h4><u>Stability Condition:</u> <InlineMath math="\Delta < 0" /></h4>
							<div className="row">
								<div className="block-12">
								    <InlineMath math="\Delta =" />{Math.round(this.state.delta*10)/10}
								</div>
							</div>
						</div>
					</div>	
				    <div className="block-10">
				    	<div id="graph_selector" className="row">
					    	<div className="block-2">
					    		<button id="islm_btn" className={"btn " + this.state.graph_sel.islm_sel} name="islm" onClick={this.handleGraph}>ISLM</button>
					    	</div>
							<div className="block-2">
					    		<button id="traj_btn" className={"btn " + this.state.graph_sel.traj_sel} name="traj" onClick={this.handleGraph}>Trajectory</button>
					    	</div>
					    </div>
				    	<div id="model">
					        <Plot
					        	data={this.state[this.state.graph_sel.value+"_data"]}
						        layout={this.state[this.state.graph_sel.value+"_layout"]}
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
  document.getElementById('root-samuelson_1941')
);