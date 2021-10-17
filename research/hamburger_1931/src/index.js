import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';
import {round} from 'mathjs'

function randn_bm(mu, sigma) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return sigma**2 * Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) + mu;
}

var odex = require('odex');// see https://github.com/littleredcomputer/odex-js
var s = new odex.Solver(2);

var vanDerPol = function(alpha,shocks) {
  return function(x, y) {
  	let sh = 0;
  	if(round(x,1) in shocks){
  		sh = shocks[round(x,1)]
  		// console.log(time)
  	}
    return [
		y[1],
    	alpha * (1 - y[0]**2) * y[1] - y[0] + sh
    ];
  };
};

const Plot = createPlotlyComponent(Plotly);

const steps = {
	tfinal: 5,
	alpha: 0.1,
	mu: 0.5,
	sigma: 0.5,
	state: 0.1,
	speed: 0.1
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
			   	tfinal: 100,
				alpha: 10,
				mu: 0,
				sigma: 0,
				state: 0.5,
				speed: 0,
				shocks: {}
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: '',
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<extra></extra>'
		        }
		    ],
		    layout: {
				autosize: true,
				datarevision: 0,
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
					title: "Relaxation oscillation with shocks",
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
			}
	    };

	    this.handleChange = this.handleChange.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
	}

	componentDidMount() {
		this.createShocks();
	}

	handleChange(event) {
		let partialState = Object.assign({}, this.state);
		partialState.params[event.target.name] = parseFloat(event.target.value);
		this.setState(partialState, function() {
			if(event.target.name === "mu" | event.target.name === "sigma"){
				this.createShocks()
			} else{
				this.computeEquilibrium();
			}
		});
	}

	createShocks() {
		var shocks = {}
		for(let i = 1; i <= this.state.params.tfinal; i++){
    		shocks[i] = randn_bm(this.state.params.mu,this.state.params.sigma);
    	}
    	let partialState = Object.assign({}, this.state);
		partialState.params.shocks = shocks;
		this.setState(partialState, function() {
			this.computeEquilibrium();
		});
	}

	computeEquilibrium() {
		var params = this.state.params;

		let time = [];
		let solution = [];
		let speed = [];
		// let j = 0;

		// for(let i = 0.1; i <= params.tfinal; i+=0.1){
		// 	time.push(i)
		// 	solution.push(solution[j] + speed[j])
		// 	speed.push(speed[j] + params.alpha*(1-solution[j]**2)*speed[j]-solution[j])
		// 	j += 1
		// }

		s.denseOutput = true;  // request interpolation closure in solution callback

		s.solve(vanDerPol(params.alpha,params.shocks),
			0,    // initial x value
			[params.state,params.speed],  // initial y values
			params.tfinal, // final x value
			s.grid(0.5, function(x,y) {
				// console.log(x,y)
				time.push(x);
				solution.push(y[0]);
				speed.push(y[1]);
			}));

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = solution;

		// console.log(params.shocks)

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
		const newLayout = Object.assign({}, this.state.layout);
		newLayout.datarevision += 1 //(partialState.layout.datarevision + 1) % 10;
		this.setState({
			data: partialState.data,
			layout: newLayout
		})
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>Hamburger (1931)</h1>
				<div className="row">
				    <div className="block-2">
				    	<div id="settings">
				    		<h4><u>Global Parameters</u></h4>
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
				    		<h4><u>Resistance Parameter</u></h4>
							<div className="row">
								<div className="block-6">
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
								<div className="block-6">
									<div className="entry">
								        <label>
								          State
								          <input name="state" value={this.state.params.state} step={steps.state} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>	
								<div className="block-6">
									<div className="entry">
								        <label>
								          Speed
								          <input name="speed" value={this.state.params.speed} step={steps.speed} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>							
							</div>
							<h4><u>Shocks Parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\mu" />
								          <input name="mu" value={this.state.params.mu} step={steps.mu} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\sigma" />
								          <input name="sigma" value={this.state.params.sigma} step={steps.sigma} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
					    </div>
				    </div>
				    <div className="block-10">
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
  document.getElementById('root-hamburger_1931')
);