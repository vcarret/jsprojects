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
	lim_sup: 1,
	lim_inf: 1, 
	y0: 0.5,
	y1: 0.5,
	a: 0.01,
	b: 0.01,
	t_shock: 1,
	val_shock: 0.5
}

const stab_params = ['a','b']

function Income(t,y,lim_sup,lim_inf,a,b){
  let tmp = a*y[t-1]-b*y[t-2]
  if(tmp < lim_sup & tmp > lim_inf){
    return(tmp)
  } else if(tmp >= lim_sup){
    return(lim_sup)
  } else if(tmp <= lim_inf){
    return(lim_inf)
  }
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 100,
				lim_sup: 5,
				lim_inf: -5, 
				y0: 0,
				y1: 1,
				a: 2.098,
				b: 1.1,
				t_shock: null,
				val_shock: null
	    	},
	    	data_stab: [
	    		{
	    			x: [0,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2,0.21,0.22,0.23,0.24,0.25,0.26,0.27,0.28,0.29,0.3,0.31,0.32,0.33,0.34,0.35,0.36,0.37,0.38,0.39,0.4,0.41,0.42,0.43,0.44,0.45,0.46,0.47,0.48,0.49,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95,1,1.05,1.1,1.15,1.2,1.25,1.3,1.35,1.4,1.45,1.5,1.55,1.6,1.65,1.7,1.75,1.8,1.85,1.9,1.95,2],
		            y: [0,0.2,0.28284,0.34641,0.4,0.44721,0.4899,0.52915,0.56569,0.6,0.63246,0.66332,0.69282,0.72111,0.74833,0.7746,0.8,0.82462,0.84853,0.87178,0.89443,0.91652,0.93808,0.95917,0.9798,1,1.0198,1.03923,1.0583,1.07703,1.09545,1.11355,1.13137,1.14891,1.16619,1.18322,1.2,1.21655,1.23288,1.249,1.26491,1.28062,1.29615,1.31149,1.32665,1.34164,1.35647,1.37113,1.38564,1.4,1.41421,1.48324,1.54919,1.61245,1.67332,1.73205,1.78885,1.84391,1.89737,1.94936,2,2.04939,2.09762,2.14476,2.19089,2.23607,2.28035,2.32379,2.36643,2.40832,2.44949,2.48998,2.52982,2.56905,2.60768,2.64575,2.68328,2.72029,2.75681,2.79285,2.82843],// complex - real line
		            type: 'scatter',
		            mode: 'lines',
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
                        'a: %{y:.1f}' +
		            	'<br>b: %{x:.1f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [0,2],
		        	y: [1,3], // upper segment
		        	type: 'scatter',
		        	mode: 'lines',
		        	fill: 'tonexty',
		            line: {
		            	color: "black"
		            },
		        	showlegend: false,
		            hovertemplate: 
                        'a: %{y:.1f}' +
		            	'<br>b: %{x:.1f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [1,1],
		        	y: [0,2], // complex explosion vs damped
		        	mode: 'lines',
		            line: {
		        		dash: 'dot',
		        		color: 'grey'
		            },
		        	showlegend: false,
		            hovertemplate: 
                        'a: %{y:.1f}' +
		            	'<br>b: %{x:.1f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],// current point
		        	mode: 'markers',
		        	type: 'scatter',
		        	// marker: {size:16},
		        	showlegend: false,
		            hoverinfo: '',
		            hovermode: false
		        },
		        {
					x: [0.25],
					y: [1.2],
					mode: 'text',
					showlegend: false,
					// name: 'Markers and Text',
					text: ['Stable<br>Keynes-point'],
					textposition: 'bottom',
					type: 'scatter'
				},
		        {
					x: [1.7],
					y: [2.8],
					mode: 'text',
					showlegend: false,
					// name: 'Markers and Text',
					text: ['Unstable<br>Goudriaan-points'],
					textposition: 'bottom',
					type: 'scatter'
				}
		    ],
	    	data_traj: [
	    		{
	    			x: [],
		            y: [],// Income traj
		            type: 'scatter',
		            mode: 'lines',
		            name: "Prices",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>y: %{y:.1f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],// upper limit
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'grey'
		        	},
		        	showlegend: false,
		            hoverinfo: '',
		            hovermode: false
		        },
		        {
		        	x: [],
		        	y: [],// lower limit
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'grey'
		        	},
		        	showlegend: false,
		            hoverinfo: '',
		            hovermode: false
		        }
		    ],
		    layout_stab: {
				autosize: true,
				showlegend: true,
				hovermode: 'closest',
				displayModeBar: false,
				margin: {
					l: 50,
					r: 25,
					b: 50,
					t: 40,
					pad: 4
				},
				paper_bgcolor: '#cecece',
  		// 		plot_bgcolor: '#cccccc',
				yaxis: {
					title: 'a',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    range: [0,3]
				},
				xaxis: {
					title: 'b',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: [0,2]
				},
				annotations: [{
				    xref: 'paper',
				    yref: 'paper',
				    x: 0.5,
				    xanchor: 'right',
				    y: 0.75,
				    yanchor: 'bottom',
				    text: 'Stable Goudriaan-points',
				    showarrow: false
				  }, {
				    xref: 'paper',
				    yref: 'paper',
				    x: 0.6,
				    xanchor: 'left',
				    y: 0.3,
				    yanchor: 'top',
				    text: 'Explosive cycles',
				    showarrow: false
				 }, {
				    xref: 'paper',
				    yref: 'paper',
				    x: 0.15,
				    xanchor: 'left',
				    y: 0.2,
				    yanchor: 'top',
				    text: 'Damped cycles',
				    showarrow: false
				 }, {
				    xref: 'paper',
				    yref: 'paper',
				    x: 0.5,
				    xanchor: 'left',
				    y: 0.45,
				    yanchor: 'top',
				    text: 'Undamped cycles',
				    showarrow: true
				 }]
			},
		    layout_traj: {
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
					title: "Income, y",
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
	    this.computeTraj = this.computeTraj.bind(this);
	    // this.handleStabClick = this.handleStabClick.bind(this);
	    this.drawPoint = this.drawPoint.bind(this)
	}

	drawPoint() {
		let partialState = Object.assign({}, this.state);
		partialState.data_stab[3].x = [this.state.params.b];
		partialState.data_stab[3].y = [this.state.params.a];

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59 the feature is in development as of January 2021 
        // But see https://community.plotly.com/t/moving-shapes-with-mouse-in-plotly-js-reactjs/11457/6 to have a draggable shape (see also https://github.com/plotly/plotly.js/pull/2532)
        const newLayout = Object.assign({}, this.state.layout_stab);
        newLayout.datarevision = (partialState.layout_stab.datarevision + 1) % 10;

		this.setState({
			data_stab: partialState.data_stab,
			layout_stab: newLayout
		})
	}

	componentDidMount() {
		this.computeTraj();
		this.drawPoint();
	}

	handleChange(event) {
		let partialState = Object.assign({}, this.state);

		partialState.params[event.target.name] = parseFloat(event.target.value);

		this.setState(partialState, function() {
			this.computeTraj();
			if(stab_params.includes(event.target.name)){
				this.drawPoint();
			}
		});
	}

	computeTraj() {
		var params = this.state.params;
		let time = [0,1];
		let income = [params.y0,params.y1];

		for(let t = 2; t <= params.tfinal; t += 1){
			time.push(t);
			if(params.t_shock){
				if(t === params.t_shock){
					income.push(params.val_shock)
				} else{
					income.push(Income(t,income,params.lim_sup,params.lim_inf,params.a,params.b));
				}
			} else{
				income.push(Income(t,income,params.lim_sup,params.lim_inf,params.a,params.b));
			}
		}

		let partialState = Object.assign({}, this.state);
		partialState.data_traj[0].x = time;
		partialState.data_traj[0].y = income;

		partialState.data_traj[1].x = [0,params.tfinal];
		partialState.data_traj[1].y = [params.lim_sup,params.lim_sup];
		// partialState.data_traj[2].x = [0,params.tfinal];
		// partialState.data_traj[2].y = [0,0];
		partialState.data_traj[2].x = [0,params.tfinal];
		partialState.data_traj[2].y = [params.lim_inf,params.lim_inf];

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout_traj);
        newLayout.yaxis.range = [1.1*params.lim_inf,1.1*params.lim_sup];
        newLayout.datarevision = (partialState.layout_traj.datarevision + 1) % 10;

		this.setState({
			data_traj: partialState.data_traj,
			layout_traj: newLayout
		})
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>Tinbergen (1944)</h1>
				<div className="row">
				    <div className="block-4">
				    	<div id="settings">
				    		<h4><u>Trajectory parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="t_{final}" />
								          <input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="y(0)" />
								          <input name="y0" value={this.state.params.y0} step={steps.y0} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="y(1)" />
								          <input name="y1" value={this.state.params.y1} step={steps.y1} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          lim(sup)
								          <input name="lim_sup" value={this.state.params.lim_sup} step={steps.lim_sup} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          lim(inf)
								          <input name="lim_inf" value={this.state.params.lim_inf} step={steps.lim_inf} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="a" />
								          <input name="a" value={this.state.params.a} step={steps.a} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="b" />
								          <input name="b" value={this.state.params.b} step={steps.b} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
						</div>
				    	<div id="stab_diag">
				    		<h4><u>Stability</u></h4>
					        <Plot // See https://github.com/plotly/plotly.js/pull/5416 and the discussions from previous PR about everywhere click
					        	data={this.state.data_stab}
						        layout={this.state.layout_stab}
						        style={{width: "100%", height: "100%"}}
						        useResizeHandler={true}
							    />
					    </div>
				    </div>
				    <div className="block-8">
				    	<div id="model">
					        <Plot
					        	data={this.state.data_traj}
						        layout={this.state.layout_traj}
						        style={{width: "100%", height: "100%"}}
						        useResizeHandler={true}
							    />
					    </div>
						<div className="block-4">
				    		<div id="shock_settings">
					    		<h4><u>Add a shock</u></h4>
						        <div className="row">
									<div className="block-6">
										<div className="entry">
									        <label>
									          Time of shock
									          <input name="t_shock" value={this.state.params.t_shock} step={steps.t_shock} className="entry-form" type="number" onChange={this.handleChange} />
									        </label>
									    </div>
									</div>
									<div className="block-6">
										<div className="entry">
									        <label>
									          y value
									          <input name="val_shock" value={this.state.params.val_shock} step={steps.val_shock} className="entry-form" type="number" onChange={this.handleChange} />
									        </label>
									    </div>
									</div>
								</div>
							</div>
					    </div>
				    </div>
				</div>
      		</div>
		)
	}
}

ReactDOM.render(
  <App />,
  document.getElementById('root-tinbergen_1944')
);