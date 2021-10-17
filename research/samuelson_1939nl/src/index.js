import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	tfinal: 10,
	alpha: 0.05,
	beta: 0.05,
	gv_exp: 1,
	init_cons: 1,
	init_inv: 1,
	curv: 0.05
}

const btn_choices = ["traj","cons"]

function consumption(alpha,income,curv,t){
    return(alpha*income[t-1]**curv);
}

function investment(beta,cons,t){
    return(beta*(cons[t] - cons[t-1]));
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 50,
				alpha: 0.9,
				beta: 1,
				gv_exp: 1,
				init_cons: 0,
				init_inv: 0,
				curv: 0.65
	    	},
	    	graph_sel: {
	    		value: "traj",
	    		traj_sel: "sel",
	    		cons_sel: ""
	    	},
			selectedOption: 'permanent',
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
		    cons_data: [
	    		{
	    			x: [],// Income
		            y: [],// Conso
		            type: 'scatter',
		            mode: 'lines',
		            name: "Consumption Schedule",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.2f}' +
                        '<br>C: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],// Income
		            y: [],// Global Demand
		            mode: 'lines',
		            name: "Aggregate Demand",
		            line: {
		            	dash: 'dot',
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.2f}' +
                        '<br>C: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],// Income
		            y: [],// Income
		            type: 'scatter',
		            mode: 'lines',
		            name: "45° line",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.2f}' +
                        '<br>C: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],// Income
		            y: [],// Consumption
		            type: 'scatter',
		            mode: 'lines',
		            name: "Real trajectory",
		            line: {
		            	color: "red"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	'Y: %{x:.2f}' +
                        '<br>C: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
		    traj_layout: {
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
  		// 		plot_bgcolor: '#cccccc',
				yaxis: {
					title: "Income, Y(t)",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
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
			},
		    cons_layout: {
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
				yaxis: {
					title: "Consumption, Aggregate Demand",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    autorange: true
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
			}
	    };

	    this.handleChange = this.handleChange.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
	    this.onValueChange = this.onValueChange.bind(this);
	    this.handleGraph = this.handleGraph.bind(this);
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

	onValueChange(event) {
		this.setState({
			selectedOption: event.target.value
		}, function() {
			this.computeEquilibrium();
		});
	}

	componentDidMount() {
		this.computeEquilibrium(this.state.params);
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

		var time = [0,1];
		var income = [params.init_cons+params.init_inv,params.init_cons+params.init_inv];
		var cons = [params.init_cons,params.init_cons];
		var inv = [params.init_inv,params.init_inv];
        
        var t = 2;
        time.push(t);
		cons.push(consumption(params.alpha,income,params.curv,t))
		inv.push(investment(params.beta,cons,t))
        income.push(cons[t] + inv[t] + params.gv_exp) 

        let gv_exp = 0
        if(this.state.selectedOption === "permanent") gv_exp = params.gv_exp 

        for(t = 3; t <= params.tfinal ; t++){
			time.push(t);
			cons.push(consumption(params.alpha,income,params.curv,t))
			let tmp = investment(params.beta,cons,t)
			if(tmp + cons[t] + gv_exp < 0) tmp = 0
			inv.push(tmp)
            income.push(cons[t] + inv[t] + gv_exp)
        }


		if(this.state.graph_sel.value === 'traj'){
			let partialState = Object.assign({}, this.state);
			partialState.traj_data[0].x = time;
			partialState.traj_data[0].y = income;

	        partialState.traj_data[1].x = time
	        partialState.traj_data[1].y = inv

	        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
	        const traj_newLayout = Object.assign({}, this.state.traj_layout);
	        traj_newLayout.datarevision = (partialState.traj_layout.datarevision + 1) % 10;
			this.setState({
				traj_data: partialState.traj_data,
				traj_layout: traj_newLayout
			})
		} else if(this.state.graph_sel.value === 'cons'){
			var inc_sched = [];
			var cons_sched = [];
			var aggdem_sched = [];
			var cons_exp = [];
			console.log(Math.max(...income))
			for(let i = 0; i <= 1.5*Math.max(...income); i+=0.1){
				inc_sched.push(i)
				cons_sched.push(params.alpha*i**(params.curv))
				aggdem_sched.push(params.alpha*i**(params.curv)+gv_exp)
			}

			for(let i = 0; i <= cons.length; i++){
				cons_exp.push(cons[i] + gv_exp)
			}

			let partialState = Object.assign({}, this.state);
			partialState.cons_data[0].x = inc_sched;
			partialState.cons_data[0].y = cons_sched;

			partialState.cons_data[1].x = inc_sched;
			partialState.cons_data[1].y = aggdem_sched;

			partialState.cons_data[2].x = inc_sched;
			partialState.cons_data[2].y = inc_sched;

			partialState.cons_data[3].x = income;
			partialState.cons_data[3].y = cons_exp;

	        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
	        const cons_newLayout = Object.assign({}, this.state.cons_layout);
	        cons_newLayout.datarevision = (partialState.cons_layout.datarevision + 1) % 10;
			this.setState({
				cons_data: partialState.cons_data,
				cons_layout: cons_newLayout
			})
		}
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>Samuelson (1939)</h1>
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
							</div>
				    		<h4><u>Economic parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\alpha" />
								          <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\beta" />
								          <input name="beta" value={this.state.params.beta} step={steps.beta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-6">
									<div className="form-group form-inline">
								        <label>
								          Curvature of consumption
								        </label>
								        <input name="curv" value={this.state.params.curv} step={steps.curv} className="entry-form" type="number" onChange={this.handleChange} style={{display:'inline-block'}}/>
								    </div>
								</div>
							</div>
				    		<h4><u>Policy shock (at t=2)</u></h4>
							<div className="row">						
								<div className="block-5">
									<div className="entry">
								        <label>
								          Gv. exp.:
								          <input name="gv_exp" value={this.state.params.gv_exp} step={steps.gv_exp} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-7">
									<div className="entry">
							          	<label>
								            <input
												type="radio"
												value="temporary"
												checked={this.state.selectedOption === "temporary"}
												onChange={this.onValueChange}
								            />
							            Temporary
							          </label>
							        </div>
								</div>
								<div className="block-7">
									<div className="entry">
							          	<label>
								            <input
								              type="radio"
								              value="permanent"
								              checked={this.state.selectedOption === "permanent"}
								              onChange={this.onValueChange}
								            />
							            Permanent
							          </label>
							        </div>
								</div>
							</div>
					    </div>
				    </div>
				    <div className="block-10">
				    	<div id="graph_selector" className="row">
					    	<div className="block-2">
					    		<button id="traj_btn" className={"btn " + this.state.graph_sel.traj_sel} name="traj" onClick={this.handleGraph}>Trajectory</button>
					    	</div>
							<div className="block-2">
					    		<button id="cons_btn" className={"btn " + this.state.graph_sel.cons_sel} name="cons" onClick={this.handleGraph}>Consumption schedule</button>
					    	</div>
					    </div>
				    	<div id="model">
					        <Plot
				        		// data={this.state.islm_data}
						        // layout={this.state.islm_layout}
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
  document.getElementById('root-samuelson_1939_nonlinear')
);