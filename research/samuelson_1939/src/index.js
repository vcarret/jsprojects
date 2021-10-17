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
	init_inv: 1
}

function consumption(alpha,income,t){
    return(alpha*income[t-1]);
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
				alpha: 0.5,
				beta: 1,
				gv_exp: 1,
				init_cons: 0,
				init_inv: 0
	    	},
			selectedOption: 'permanent',
	    	data: [
	    		{
	    			x: [],
		            y: [],// Income
		            type: 'scatter',
		            mode: 'lines',
		            name: "Income",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>Y: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'grey'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>Y: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
		    layout: {
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
					title: "Income Y(t)",
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
	    this.onValueChange = this.onValueChange.bind(this);
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
		cons.push(consumption(params.alpha,income,t))
		inv.push(investment(params.beta,cons,t))
        income.push(cons[t] + inv[t] + params.gv_exp) 

        let gv_exp = 0
        if(this.state.selectedOption === "permanent") gv_exp = params.gv_exp 

        for(t = 3; t <= params.tfinal ; t++){
			time.push(t);
			cons.push(consumption(params.alpha,income,t))
			inv.push(investment(params.beta,cons,t))
            income.push(cons[t] + inv[t] + gv_exp)            
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = income;

		const eq = gv_exp / (1-params.alpha)
        partialState.data[1].x = [0,params.tfinal]
        partialState.data[1].y = [eq,eq]

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
		this.setState({
			data: partialState.data,
			layout: newLayout
		})
		// console.log(this.state)
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
{/*							<h4><u>Initial Conditions</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          Init. cons.:
								          <input name="init_cons" value={this.state.params.init_cons} step={steps.init_cons} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          Init. inv.:
								          <input name="init_inv" value={this.state.params.init_inv} step={steps.init_inv} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>*/}
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
  document.getElementById('root-samuelson_1939')
);