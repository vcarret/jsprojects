import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

// https://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
function cuberoot(x) {
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
}

function solveCubic(a, b, c, d) {
    if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
        a = b; b = c; c = d;
        if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
            a = b; b = c;
            if (Math.abs(a) < 1e-8) // Degenerate case
                return [];
            return [-b/a];
        }

        let D = b*b - 4*a*c;
        if (Math.abs(D) < 1e-8)
            return [-b/(2*a)];
        else if (D > 0)
            return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
        return [];
    }

    // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
    var p = (3*a*c - b*b)/(3*a*a);
    var q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
    var roots;

    if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
        roots = [cuberoot(-q)];
    } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
        roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
    } else {
        let D = q*q/4 + p*p*p/27;
        if (Math.abs(D) < 1e-8) {       // D = 0 -> two roots
            roots = [-1.5*q/p, 3*q/p];
        } else if (D > 0) {             // Only one real root
            let u = cuberoot(-q/2 - Math.sqrt(D));
            roots = [u - p/(3*u)];
        } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
            let u = 2*Math.sqrt(-p/3);
            var t = Math.acos(3*q/p/u)/3;  // D < 0 implies p < 0 and acos argument in [-1..1]
            var k = 2*Math.PI/3;
            roots = [u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k)];
        }
    }

    // Convert back from depressed cubic
    for (var i = 0; i < roots.length; i++)
        roots[i] -= b/(3*a);

    return roots;
}

const Plot = createPlotlyComponent(Plotly);

const steps = {
	tfinal: 10,
	a: 0.01,
	b: 0.01,
	c: 0.01,
	d: 0.01,
	e: 0.01,
	f: 0.01,
	g: 0.01,
	h: 0.01,
	Z0: 0.5,
	Z1: 0.5,
	stime: 10,
	svalue: 0.01
}

function profits(a,b,c,d,e,f,g,h,Z,t){
  return((a+e*g+h)*Z[t-1]+(b+f*g-h)*Z[t-2]+c*Z[t-2]**2+d*Z[t-2]**3)
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 200,
				a: 0.45,
				b: -0.06,
				c: -1.53,
				d: -2.56,
				e: 1,
				f: 2.2,
				g: 0.12,
				h: 1.2,
				Z0: -0.2669377,
				Z1: -0.2669377,
				stime: 20,
				svalue: -0.01
	    	},
			selectedOption: 'eq2',
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
					title: "Profits, Z(t)",
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

		var time = [];
		var Z = [];

		var eq = solveCubic(params.d,params.c,(params.a+params.e*params.g+params.b+params.f*params.g-1),0)
		// console.log(eq)

		var init = 0; 
		if(this.state.selectedOption === "eq1" | eq.length === 1){
			init = eq[0]
		} else if(this.state.selectedOption === "eq2"){
			init = eq[1]
		} else if(this.state.selectedOption === "eq3"){
			init = eq[2]
		} else{
			init = 0
		}

		for(var t = 0; t < params.stime; t++){
			time.push(t)
			Z.push(init)
		}

		time.push(t)
		Z.push(init+params.svalue)
        
        for(t=t+1; t <= params.tfinal; t++){
			time.push(t);
			
			Z.push(profits(params.a,params.b,params.c,params.d,params.e,params.f,params.g,params.h,Z,t))
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = Z;

		const eq0 = eq[0]
        partialState.data[1].x = [0,params.tfinal]
        partialState.data[1].y = [eq0,eq0]
        if(eq.length > 0){
	        const eq1 = eq[1]
	        partialState.data[2].x = [0,params.tfinal]
	        partialState.data[2].y = [eq1,eq1]
	
	        const eq2 = eq[2]
	        partialState.data[3].x = [0,params.tfinal]
	        partialState.data[3].y = [eq2,eq2]
        }

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.xaxis.range = [0,this.state.params.tfinal]
        // newLayout.yaxis.range = [1.1*Math.min(...Z),1.1*Math.max(...Z)]
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
				<h1>Tinbergen (1937)</h1>
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
				    		<h4><u>Sensitivity parameters</u></h4>
				    		<h5>Profit consumption</h5>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="a" />
								          <input name="a" value={this.state.params.a} step={steps.a} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="b" />
								          <input name="b" value={this.state.params.b} step={steps.b} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="c" />
								          <input name="c" value={this.state.params.c} step={steps.c} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="d" />
								          <input name="d" value={this.state.params.d} step={steps.d} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h5>Investment</h5>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="e" />
								          <input name="e" value={this.state.params.e} step={steps.e} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="f" />
								          <input name="f" value={this.state.params.f} step={steps.f} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="g" />
								          <input name="g" value={this.state.params.g} step={steps.c} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h5>Speculation</h5>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="h" />
								          <input name="h" value={this.state.params.h} step={steps.h} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Shock</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          Shock time:
								          <input name="stime" value={this.state.params.stime} step={steps.stime} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          Deviation:
								          <input name="svalue" value={this.state.params.svalue} step={steps.svalue} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Initial Conditions</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
							          	<label>
								            <input
												type="radio"
												value="eq1"
												checked={this.state.selectedOption === "eq1"}
												onChange={this.onValueChange}
								            />
							            Eq. 1
							          </label>
							        </div>
								</div>
								<div className="block-3">
									<div className="entry">
							          	<label>
								            <input
								              type="radio"
								              value="eq2"
								              checked={this.state.selectedOption === "eq2"}
								              onChange={this.onValueChange}
								            />
							            Eq. 2
							          </label>
							        </div>
								</div>
								<div className="block-3">
									<div className="entry">
							          	<label>
								            <input
								              type="radio"
								              value="eq3"
								              checked={this.state.selectedOption === "eq3"}
								              onChange={this.onValueChange}
								            />
							            Eq. 3
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
  document.getElementById('root-tinbergen_1937')
);