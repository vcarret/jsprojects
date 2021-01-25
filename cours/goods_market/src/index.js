import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	"alpha": 0.05,
	"iy": 0.01,
	"ir": 1,
	"cpi": 5,
	"bari": 5,
	"g": 5,
	"r0": 0.5
}

const btn_choices = ["gm_invep","gm_is"]

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
		    	alpha: 0.6,
		    	iy: 0.05,
		    	ir: -100,
		    	cpi: 200,
		    	bari: 350,
		    	g: 350,
		    	r0: 5,
		    	ymaxaxis: 4000,
		    	rmaxaxis: 10,
		    	ismaxaxis: 1200
	    	},
	    	graph_sel: {
	    		value: "gm_invep",
	    		gm_invep_sel: "sel",
	    		gm_is_sel: ""
	    	},
	    	gm_data: [
	    		{
	    			x: [],
		            y: [],// y = yd
		            xaxis: 'x',
		            yaxis: 'y',
		            type: 'scatter',
		            mode: 'lines',
		            name: "Yd = y",
		            line: {
		            	color: "blue"
		            },
		            hovertemplate: 
		            	'Yd=y=%{x:.0f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// yd
		            type: 'scatter',
		            mode: 'lines',
		            name: "Yd",
		            xaxis: 'x',
		            yaxis: 'y',
		            line: {
		            	color: "red",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>Yd: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// yd 1 (after shock)
		            type: 'scatter',
		            mode: 'lines',
		            name: "Yd 1",
		            xaxis: 'x',
		            yaxis: 'y',
		            line: {
		            	color: "orange",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>Yd 1: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		            xaxis: 'x',
		            yaxis: 'y',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>Yd: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		            xaxis: 'x',
		            yaxis: 'y',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>Yd: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
	    	invep_data: [
	    		{
	    			x: [],
		            y: [],// I
		            type: 'scatter',
		            mode: 'lines',
		            name: "I",
		            xaxis: 'x2',
		            yaxis: 'y2',
		            line: {
		            	color: "#ab3bf2"
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>I: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// I 1
		            type: 'scatter',
		            mode: 'lines',
		            name: "I 1",
		            xaxis: 'x2',
		            yaxis: 'y2',
		            line: {
		            	color: "#40125e",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>I: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// S
		            type: 'scatter',
		            mode: 'lines',
		            name: "S",
		            xaxis: 'x2',
		            yaxis: 'y2',
		            line: {
		            	color: "4dbc52",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>S: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// S 1
		            type: 'scatter',
		            mode: 'lines',
		            name: "S 1",
		            xaxis: 'x2',
		            yaxis: 'y2',
		            line: {
		            	color: "orange",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>S: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		            xaxis: 'x2',
		            yaxis: 'y2',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>S=I=%{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		            xaxis: 'x2',
		            yaxis: 'y2',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>S=I=%{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
	    	is_data: [
	    		{
	    			x: [],
		            y: [],// is
		            type: 'scatter',
		            mode: 'lines',
		            name: "IS",
		            xaxis: 'x3',
		            yaxis: 'y3',
		            line: {
		            	color: "red"
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// is 1
		            type: 'scatter',
		            mode: 'lines',
		            name: "IS 1",
		            xaxis: 'x3',
		            yaxis: 'y3',
		            line: {
		            	color: "orange",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		            xaxis: 'x3',
		            yaxis: 'y3',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		            xaxis: 'x3',
		            yaxis: 'y3',
		        	line: {
		        		dash: 'dot',
		        		color: 'green'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
		    layout: {
				autosize: true,
				showlegend: false,
				// legend: {
				// 	x: 0.8,
				// 	y: 0.95, 
				// 	font: {
				// 		size:18
				// 	},
				// 	bgcolor: '#fff',
				// },
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
				xaxis: {
					domain: [0,0.45],
					title: 'Income, y',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: []
				},
				yaxis: {
					anchor: "x",
					title: "Demand, Yd",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: []
				},
				xaxis2: {
					domain: [0.55,1],
					title: 'Income, y',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: []
				},
				yaxis2: {
					anchor: "x2",
					title: "Investment and Savings",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: []
				},
				xaxis3: {
					domain: [0.55,1],
					title: 'Income, y',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: []
				},
				yaxis3: {
					anchor: 'x3',
					title: 'Interest rate, r',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: []
				}
			},
	    	shocks: {
	    		new_val: '',
	    		shocked_var: ''
	    	}
	    };

	    this.handleChange = this.handleChange.bind(this);
	    this.handleShock = this.handleShock.bind(this);
	    this.handleGraph = this.handleGraph.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
	}

	componentDidMount() {
		this.computeEquilibrium(this.state.params,0,true);
	}

	handleGraph(event) {
		if(event.target.name !== this.state.graph_sel){
			var graph_sel = {
				value: event.target.name
			}
			graph_sel[event.target.name+"_sel"] = "sel"
			graph_sel[btn_choices[(btn_choices.indexOf(event.target.name)+1)%2]+"_sel"] = ""
			this.setState({
				graph_sel: graph_sel
			}, function() {
				this.computeEquilibrium(this.state.params);
				if(this.state.shocks.new_val !== ''){
					let shocked_params = Object.assign({}, this.state.params);
					shocked_params[this.state.shocks.shocked_var] = parseFloat(this.state.shocks.new_val);
					this.computeEquilibrium(shocked_params, 1)
				}
			})
		}
	}

	handleShock(event) {
		const target = event.target;
		let partialState = Object.assign({}, this.state);

		if(target.className === 'shocked_var'){
			// if(target.value !== ''){
				partialState.shocks.new_val = "";
				partialState.shocks.shocked_var = target.value;
				partialState.gm_data[2].x = [];
				partialState.gm_data[2].y = [];
				partialState.invep_data[1].x = [];
				partialState.invep_data[1].y = [];
				partialState.invep_data[3].x = [];
				partialState.invep_data[3].y = [];
				partialState.is_data[1].x = [];
				partialState.is_data[1].y = [];
				this.setState(partialState, function() {
					this.computeEquilibrium(partialState.params);
				});
			// }
		} else if (target.className === 'entry-form'){
			if(this.state.shocks.shocked_var){
				if(target.value){
					partialState.shocks.new_val = parseFloat(target.value);
					let shocked_params = Object.assign({}, this.state.params);
					shocked_params[this.state.shocks.shocked_var] = parseFloat(target.value);
					this.setState(partialState, function() {
						this.computeEquilibrium(shocked_params,1);
					})					
				} else{
					partialState.shocks.new_val = ""
					partialState.gm_data[2].x = [];
					partialState.gm_data[2].y = [];
					partialState.invep_data[1].x = [];
					partialState.invep_data[1].y = [];
					partialState.invep_data[3].x = [];
					partialState.invep_data[3].y = [];
					partialState.is_data[1].x = [];
					partialState.is_data[1].y = [];
					this.setState(partialState, function() {
						this.computeEquilibrium(partialState.params);
					});
				}
			}
		}
	}

	handleChange(event) {
		let partialState = Object.assign({}, this.state);
		partialState.params[event.target.name] = parseFloat(event.target.value);
		this.setState(partialState);

		this.computeEquilibrium(this.state.params);
	}

	computeEquilibrium(params, shock = 0, first = false) {
		let partialState = Object.assign({}, this.state);
		var revenu = [];
		for( let i = 0; i < this.state.params.ymaxaxis; i++){
			revenu.push(i)
		}
		if(first){
			partialState.gm_data[0].x = revenu;
			partialState.gm_data[0].y = revenu;				
		}
		let eq = (-params.alpha+params.cpi+params.ir*params.r0+params.bari+params.g)/(1-params.alpha-params.iy);
		let invepeq = (1-params.alpha)*eq-params.cpi;
		let data = [];
		var yd = [];

		if(this.state.graph_sel.value === 'gm_invep'){
			var inv = [];
			var savings = [];

			for(let y of revenu){
				yd.push(params.alpha*y+params.cpi+params.iy*y+params.ir*params.r0+params.bari+params.g);
				inv.push(params.iy*y+params.ir*params.r0+params.bari+params.g);
				savings.push((1-params.alpha)*y-params.cpi);
			}

			partialState.gm_data[1+shock].x = revenu;
			partialState.gm_data[1+shock].y = yd;
			partialState.gm_data[3].x = [0,eq];
			partialState.gm_data[3].y = [eq,eq];
			partialState.gm_data[4].x = [eq,eq];
			partialState.gm_data[4].y = [0,eq];
			partialState.invep_data[0+shock].x = revenu;
			partialState.invep_data[0+shock].y = inv;
			partialState.invep_data[2+shock].x = revenu;
			partialState.invep_data[2+shock].y = savings;
			partialState.invep_data[4].x = [0,eq];
			partialState.invep_data[4].y = [invepeq,invepeq];
			partialState.invep_data[5].x = [eq,eq];
			partialState.invep_data[5].y = [0,invepeq];

			partialState.layout.yaxis2.range = [0,this.state.params.ismaxaxis];

			data = partialState.gm_data.concat(partialState.invep_data);
		} else if(this.state.graph_sel.value === 'gm_is'){
			var is_curve = [];

			for(let y of revenu){
				yd.push(params.alpha*y+params.cpi+params.iy*y+params.ir*params.r0+params.bari+params.g);
				is_curve.push(((1-params.alpha-params.iy)*y+params.alpha-params.cpi-params.bari-params.g)/params.ir);
			}

			partialState.gm_data[1+shock].x = revenu;
			partialState.gm_data[1+shock].y = yd;
			partialState.gm_data[3].x = [0,eq];
			partialState.gm_data[3].y = [eq,eq];
			partialState.gm_data[4].x = [eq,eq];
			partialState.gm_data[4].y = [0,eq];
			partialState.is_data[0+shock].x = revenu;
			partialState.is_data[0+shock].y = is_curve;
			
			partialState.layout.yaxis3.range = [0,this.state.params.rmaxaxis];

			data = partialState.gm_data.concat(partialState.is_data);
		}
		
		partialState.layout.yaxis.range = [0,this.state.params.ymaxaxis];

		this.setState({
			data: data,
			layout: partialState.layout
		})
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>The Keynesian Cross and the IS curve</h1>
				<div className="row">
				    <div className="block-3">
				    	<div id="settings">
				    		<h4><u>Max values on the axes</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          Income
								          <input name="ymaxaxis" value={this.state.params.ymaxaxis} step="10" className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          Inv. and Sav.
								          <input name="ismaxaxis" value={this.state.params.ismaxaxis} step="10" className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								         Int. rate
								          <input name="rmaxaxis" value={this.state.params.rmaxaxis} step="10" className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>IS parameters</u></h4>
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
								          <InlineMath math="C_{\pi}" />
								          <input name="cpi" value={this.state.params.cpi} step={steps.cpi} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="I_y" />
								          <input name="iy" value={this.state.params.iy} step={steps.iy} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="I_r" />
								          <input name="ir" value={this.state.params.ir} step={steps.ir} className="entry-form" type="number" onChange={this.handleChange} />
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
								          <InlineMath math="g" />
								          <input name="g" value={this.state.params.g} step={steps.g} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\bar{r}" />
								          <input name="r0" value={this.state.params.r0} step={steps.r0} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Shock</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
									        Variable:
									        <select className="shocked_var" name="shocked_var_1" value={this.state.shocks.shocked_var_1} onChange={this.handleShock}>
									        	<option value=""></option>
												<option value="alpha">alpha</option>
												<option value="iy">I_y</option>
												<option value="ir">I_r</option>
												<option value="cpi">C_\pi</option>
												<option value="bari">I_0</option>
												<option value="g">g</option>
											</select>
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          Value:
								          <input name="new_val_1" value={this.state.shocks.new_val} step={steps[this.state.shocks.shocked_var]} className="entry-form" type="number" onChange={this.handleShock} />
								        </label>
								    </div>
								</div>
							</div>
					    </div>
				    </div>
				    <div className="block-9">
				    	<div id="graph_selector" className="row">
					    	<div className="block-2">
					    		<button id="gm_invep_btn" className={"btn " + this.state.graph_sel.gm_invep_sel} name="gm_invep" onClick={this.handleGraph}>Investment and savings</button>
					    	</div>
							<div className="block-2">
					    		<button id="gm_is_btn" className={"btn " + this.state.graph_sel.gm_is_sel} name="gm_is" onClick={this.handleGraph}>IS curve</button>
					    	</div>
					    </div>
				    	<div id="model">
					        <Plot
					        	data={this.state.data}
						        layout={this.state.layout}
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
  document.getElementById('root-is-kc')
);