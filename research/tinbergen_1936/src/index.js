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
	theta: 1,
	a: 0.1,
	k: 1,
	P: 5,
	A: 5,
	K: 10,
	P0: 0.5,
	P1: 0.5
}

function demand(K,k,p,P,theta,t){
    return(K + k*theta*(p[t-theta/2]-P));
}

function supply(A,a,p,P,theta,t){
    return(A + a*(p[t-theta]-P));
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
		    tfinal: 30,
			theta: 2,
			a: 1,
			k: 500/6,
			P: 100,
			A: 100,
			K: 10000,
			P0: 0,
			P1: 9
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],// IS 1
		            type: 'scatter',
		            mode: 'lines',
		            name: "Prices",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>p: %{y:.1f}' +
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
                        '<br>p: %{y:.1f}' +
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
                        '<br>p: %{y:.1f}' +
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
					title: "Prices, P + p(t)",
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
		var prices = [params.P+params.P0,params.P+params.P1];
		var dem = [params.K,params.K];
		var sup = [params.A,params.A];
        
        let p = 0;
        for(var t = 2; t <= params.tfinal ; t++){
			time.push(t);
            dem.push(demand(params.K,params.k,prices,params.P,params.theta,t))
            sup.push(supply(params.A,params.a,prices,params.P,params.theta,t))
            p = dem[t]/sup[t]
            if(p < 0) break;
            prices.push(p)
        }
        if(prices.length < params.tfinal){
        	for(t ; t <= params.tfinal+1 ; t++){
        		time.push(t);
        		prices.push(0);
        	}
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = prices;

		const eq1 = params.P
        const eq2 = (params.k*params.theta-params.A)/params.a
        partialState.data[1].x = [0,params.tfinal]
        partialState.data[1].y = [eq1,eq1]
        partialState.data[2].x = [0,params.tfinal]
        partialState.data[2].y = [eq2,eq2]

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.xaxis.range = [0,this.state.params.tfinal]
        newLayout.yaxis.range = [0,1.1*Math.max(...prices)]
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
				<h1>Tinbergen (1936)</h1>
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
								          <InlineMath math="\theta" /> (Lag)
								          <input name="theta" value={this.state.params.theta} step={steps.theta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Sensibility parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="a" />
								          <input name="a" value={this.state.params.a} step={steps.a} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="k" />
								          <input name="k" value={this.state.params.k} step={steps.k} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Equilibrium levels</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="A" />
								          <input name="A" value={this.state.params.A} step={steps.A} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="K" />
								          <input name="K" value={this.state.params.K} step={steps.K} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="P" />
								          <input name="P" value={this.state.params.P} step={steps.P} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Initial Conditions</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="p(0)" />
								          <input name="P0" value={this.state.params.P0} step={steps.P0} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="p(1)" />
								          <input name="P1" value={this.state.params.P1} step={steps.P1} className="entry-form" type="number" onChange={this.handleChange} />
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
  document.getElementById('root-tinbergen_1936')
);