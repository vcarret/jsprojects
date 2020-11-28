import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath, BlockMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const var_is = ["alpha","iy","ir","id","cpi","bari","g","t"]
const var_lm = ["ly","lr","Ms"]

const steps = {
	"p": 0.01,
	"alpha": 0.05,
	"iy": 0.01,
	"ir": 1,
	"id": 0.01,
	"cpi": 5,
	"bari": 5,
	"g": 5,
	"t": 5,
	"ly": 0.05,
	"lr": 1,
	"Ms": 5
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
		    	p: 1,
		    	alpha: 0.6,
		    	iy: 0.05,
		    	ir: -100,
		    	id: -0.1,
		    	D: 2000,
		    	cpi: 500,
		    	bari: 400,
		    	g: 350,
		    	t: 0,
		    	ly: 0.5,
		    	lr: -100,
		    	Ms: 300,
		    	rmin: 1,
		    	ymax: 2500,
		    	rmax: 10 		
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],// IS 1
		            type: 'scatter',
		            mode: 'lines',
		            name: "IS",
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
		            y: [],// LM 1
		            type: 'scatter',
		            mode: 'lines',
		            name: "LM",
		            line: {
		            	color: "blue",
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
		        	line: {
		        		dash: 'dot'
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
		            y: [],// IS 2
		            type: 'scatter',
		            mode: 'lines',
		            name: "IS 2",
		            line: {
		            	color: "#ffa3a3"
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// LM 2
		            type: 'scatter',
		            mode: 'lines',
		            name: "LM 2",
		            line: {
		            	color: "#9393ff",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
	    			x: [],
		            y: [],// IS 3
		            type: 'scatter',
		            mode: 'lines',
		            name: "IS 3",
		            line: {
		            	color: "#770000"
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		            x: [],
		            y: [],// LM 3
		            type: 'scatter',
		            mode: 'lines',
		            name: "LM 3",
		            line: {
		            	color: "#000059",
		            },
		            hovertemplate: 
		            	'y: %{x:.0f}' +
                        '<br>r: %{y:.2f}' +
                        '<extra></extra>'
		        }
		        ],
	    	shocks: {
	    		new_val_1: "",
	    		new_val_2: "",
	    		shocked_var_1: "",
	    		shocked_var_2: ""
	    	}
	    };

	    this.handleChange = this.handleChange.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
	    // this.get_curves = this.get_curves.bind(this);
	    this.handleShock = this.handleShock.bind(this);
	}

	componentDidMount() {
		this.computeEquilibrium(this.state.params, "normal");
	}

	handleShock(event) {
		const target = event.target;
		const shock_n = target.name.charAt(target.name.length-1);
		let partialState = Object.assign({}, this.state);

		if(target.className === 'shocked_var'){
			// if(target.value !== ''){
				partialState.shocks["new_val_" + shock_n] = "";
				partialState.shocks[target.name] = target.value;
				partialState.data[2+shock_n*2].x = [];
				partialState.data[2+shock_n*2].y = [];
				partialState.data[3+shock_n*2].x = [];
				partialState.data[3+shock_n*2].y = [];
				this.setState(partialState, function() {
					this.computeEquilibrium(this.state.params, "");
				});
			// }
		} else if (target.className === 'entry-form'){
			if(this.state.shocks["shocked_var_"+shock_n]){
				if(target.value){
					partialState.shocks[target.name] = parseFloat(target.value);
					let shocked_params = Object.assign({}, this.state.params);
					// If the other shock was on the prices, we have to take it into account
					// In fact we will always take the first shock into account
					if(shock_n === "2"){
						if(this.state.shocks.new_val_1){
							shocked_params[this.state.shocks.shocked_var_1] = this.state.shocks.new_val_1;
						}
					}
					const shocked_var = this.state.shocks["shocked_var_"+shock_n]
					shocked_params[shocked_var] = parseFloat(target.value);
					let islmboth = 0;
					if(shocked_var === "p"){
						islmboth = 3;
					} else if(var_is.includes(shocked_var)){
						islmboth = 1;
					} else if(var_lm.includes(shocked_var)){
						islmboth = 2;
					}
					this.setState(partialState, function() {
						this.computeEquilibrium(shocked_params,"shock_"+shock_n+""+islmboth);
						// Shocks are cumulated so if something is changed in the first shock it must impact the second shock
						if(shock_n === "1"){
							let other_var = this.state.shocks.shocked_var_2
							if(other_var){
								shocked_params[other_var] = this.state.shocks.new_val_2
								if(var_is.includes(other_var)){
									this.computeEquilibrium(shocked_params,"shock_2"+1);
								} else if(var_lm.includes(other_var)){
									this.computeEquilibrium(shocked_params,"shock_2"+2);
								} else if(other_var === "p"){
									this.computeEquilibrium(shocked_params,"shock_2"+3);
								}
							}
						}
					})					
				} else{
					partialState.shocks[target.name] = ""
					partialState.data[2+shock_n*2].x = [];
					partialState.data[2+shock_n*2].y = [];
					partialState.data[3+shock_n*2].x = [];
					partialState.data[3+shock_n*2].y = [];
					this.setState(partialState, function() {
						this.computeEquilibrium(this.state.params, "normal");
					});
				}
			}
		}
		// console.log(event.target.className,event.target.value, event.target.name)
	}

	handleChange(event) {
		// const target = event.target;
		// const value = target.type === 'checkbox' ? target.checked : target.value;
		// const name = target.name;

		// this.setState({
		// 	params.name: value
		// })

		let partialState = Object.assign({}, this.state);
		partialState.params[event.target.name] = parseFloat(event.target.value);
		this.setState(partialState);

		this.computeEquilibrium(this.state.params, "normal");
		if(event.target.name === "rmin"){
			let shocked_params = Object.assign({}, this.state.params);
			console.log(this.state.shocks.new_val_1 && !var_is.includes(this.state.shocks.shocked_var_1))
			if(this.state.shocks.new_val_1 && !var_is.includes(this.state.shocks.shocked_var_1)){
				shocked_params[this.state.shocks.shocked_var_1] = this.state.shocks.new_val_1;
				this.computeEquilibrium(shocked_params, "shock_12");
			}
			if(this.state.shocks.new_val_2 && !var_is.includes(this.state.shocks.shocked_var_2)){
				shocked_params[this.state.shocks.shocked_var_2] = this.state.shocks.new_val_2;
				this.computeEquilibrium(shocked_params, "shock_22");
			}
		}
	}

	computeEquilibrium(params, draw) {
		// We use the values from the shocks to compute the equilibrium
		let shocked_params = Object.assign({}, params);
		if(this.state.shocks.new_val_1){
			shocked_params[this.state.shocks.shocked_var_1] = this.state.shocks.new_val_1;
		}
		if(this.state.shocks.new_val_2){
			shocked_params[this.state.shocks.shocked_var_2] = this.state.shocks.new_val_2;
		}

		const denom = shocked_params.lr*(1-shocked_params.alpha-shocked_params.iy) + shocked_params.ir*shocked_params.ly

		const r = shocked_params.Ms/shocked_params.p*(1-shocked_params.alpha-shocked_params.iy) - shocked_params.ly*(-shocked_params.alpha*shocked_params.t+shocked_params.cpi+shocked_params.id*shocked_params.D/shocked_params.p+shocked_params.bari+shocked_params.g);
		let r_star = r/denom
		let y_star = 0
		if(r_star < this.state.params.rmin){// Liquidity trap
			r_star = this.state.params.rmin
			y_star = (-shocked_params.alpha*shocked_params.t+shocked_params.cpi+shocked_params.id*shocked_params.D/shocked_params.p+shocked_params.bari+shocked_params.g+r_star*shocked_params.ir)/(1-shocked_params.alpha-shocked_params.iy)
		} else{
			const y = (-shocked_params.alpha*shocked_params.t+shocked_params.cpi+shocked_params.id*shocked_params.D/shocked_params.p+shocked_params.bari+shocked_params.g)*shocked_params.lr+shocked_params.ir*shocked_params.Ms/shocked_params.p;
			y_star = y/denom

		}
	
		const revenu = [];
		for( let i = 0; i < this.state.params.ymax; i++){
			revenu.push(i)
		}
		var r_is = [];
		var r_lm = [];

		let tmp = 0;
		for(let y of revenu){
			r_is.push(((1-params.alpha-params.iy)*y+params.alpha*params.t-params.cpi-params.id*params.D/params.p-params.bari-params.g)/params.ir);
			tmp = 1/params.lr*(params.Ms/params.p-params.ly*y);
			tmp = (tmp > params.rmin) ? tmp : params.rmin;
			r_lm.push(tmp);
		}

		let partialState = Object.assign({}, this.state);
		if(draw === "normal"){// Draw the first two curves
			partialState.data[0].x = revenu;
			partialState.data[0].y = r_is;
			partialState.data[1].x = revenu;
			partialState.data[1].y = r_lm;
		} else if(draw.includes("shock")){
			let islmboth = parseFloat(draw.charAt(draw.length-1))
			let n_shock = parseFloat(draw.charAt(draw.length-2))
			if(islmboth === 1 || islmboth === 3){
				partialState.data[2+n_shock*2].x = revenu;
				partialState.data[2+n_shock*2].y = r_is;				
			} 
			if(islmboth === 2 || islmboth === 3){
				partialState.data[3+n_shock*2].x = revenu;
				partialState.data[3+n_shock*2].y = r_lm;				
			}
		}
		partialState.data[2].x = [0,y_star];
		partialState.data[2].y = [r_star,r_star];
		partialState.data[3].x = [y_star,y_star];
		partialState.data[3].y = [0,r_star];

		// partialState.layout.yaxis.range = [0,this.state.params.rmax];
		// partialState.layout.xaxis.range = [0,this.state.params.ymax];
		// partialState.layout.annotations[0].x = y_star;
		// partialState.layout.annotations[0].y = r_star;
		// partialState.layout.annotations[0].text = 'y*=' + Math.round(y_star) + ', r*=' + Math.round(r_star*100)/100;

		this.setState(partialState)

		this.setState({
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
					title: "Interest rate, r",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: [0,this.state.params.rmax]
				},
				xaxis: {
					title: 'Income, y',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: [0,this.state.params.ymax]
				},
				annotations: [
					{
						x: y_star,
						y: r_star,
						text: 'y*=' + Math.round(y_star) + ', r*=' + Math.round(r_star*100)/100
					}
				]
			}
		})
		// console.log(this.state)
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>The IS LM Model</h1>
				<div className="row">
				    <div className="block-3">
				    	<div id="settings">
				    		<h4><u>Global parameters</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="p" />
								          <input name="p" value={this.state.params.p} step={steps.p} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								         <InlineMath math="y_{max}" />
								          <input name="ymax" value={this.state.params.ymax} step="10" className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="r_{max}" />
								          <input name="rmax" value={this.state.params.rmax} step="0.5" className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>IS parameters</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="\alpha" />
								          <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="I_y" />
								          <input name="iy" value={this.state.params.iy} step={steps.iy} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="I_r" />
								          <input name="ir" value={this.state.params.ir} step={steps.ir} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="I_D" />
								          <input name="id" value={this.state.params.id} step={steps.id} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="C_{\pi}" />
								          <input name="cpi" value={this.state.params.cpi} step={steps.cpi} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="I_0" />
								          <input name="bari" value={this.state.params.bari} step={steps.bari} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="g" />
								          <input name="g" value={this.state.params.g} step={steps.g} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="t" />
								          <input name="t" value={this.state.params.t} step={steps.t} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>LM parameters</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="L_y" />
								          <input name="ly" value={this.state.params.ly} step={steps.ly} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="L_r" />
								          <input name="lr" value={this.state.params.lr} step={steps.lr} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="M^s" />
								          <input name="Ms" value={this.state.params.Ms} step={steps.Ms} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="r_{min}" />
								          <input name="rmin" value={this.state.params.rmin} step="0.5" className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Shocks</u></h4>
							<div className="row">
								<div className="block-5">
									<div className="entry">
								        <label>
									        Var. 1:
									        <select className="shocked_var" name="shocked_var_1" value={this.state.shocks.shocked_var_1} onChange={this.handleShock}>
									        	<option value=""></option>
												<option value="p">p</option>
												<option value="alpha">alpha</option>
												<option value="iy">I_y</option>
												<option value="ir">I_r</option>
												<option value="id">I_D</option>
												<option value="cpi">C_\pi</option>
												<option value="bari">I_0</option>
												<option value="g">g</option>
												<option value="t">t</option>
												<option value="ly">L_y</option>
												<option value="lr">L_r</option>
												<option value="Ms">M^s</option>
											</select>
								        </label>
								    </div>
								</div>
								<div className="block-5">
									<div className="entry">
								        <label>
								          Value:
								          <input name="new_val_1" value={this.state.shocks.new_val_1} step={steps[this.state.shocks.shocked_var_1]} className="entry-form" type="number" onChange={this.handleShock} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-5">
									<div className="entry">
								        <label>
									        Var. 2:
									        <select className="shocked_var" name="shocked_var_2" value={this.state.shocks.shocked_var_2} onChange={this.handleShock}>
									        	<option value=""></option>
												<option value="p">p</option>
												<option value="alpha">alpha</option>
												<option value="iy">I_y</option>
												<option value="ir">I_r</option>
												<option value="id">I_D</option>
												<option value="cpi">C_\pi</option>
												<option value="bari">I_0</option>
												<option value="g">g</option>
												<option value="t">t</option>
												<option value="ly">L_y</option>
												<option value="lr">L_r</option>
												<option value="Ms">M^s</option>
											</select>
								        </label>
								    </div>
								</div>
								<div className="block-5">
									<div className="entry">
								        <label>
								          Value:
								          <input name="new_val_2" value={this.state.shocks.new_val_2} step={steps[this.state.shocks.shocked_var_2]} className="entry-form" type="number" onChange={this.handleShock} />
								        </label>
								    </div>
								</div>
							</div>
					    </div>
				    </div>
				    <div className="block-9">
				    	<div  id="model">
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

// class Diag extends React.Component {
// 	constructor(props) {
// 		super(props)
// 		this.trace1 = {
//             x: props.data.y,
//             y: props.data.is,
//             type: 'scatter',
//             mode: 'lines+markers',
//             marker: {color: 'red'},
//           }
//         this.trace2 = {
//             x: props.data.y,
//             y: props.data.lm,
//             type: 'scatter',
//             mode: 'lines+markers',
//             marker: {color: 'blue'},
//           }
// 		this.state = {
// 			data: [this.trace1,this.trace2], 
// 			layout: {
// 				autosize: true
// 			}
// 		}
// 		console.log(props)
// 	}

//   render() {
//     return (
//       <Plot
//         data={this.state.data}
//         layout={this.state.layout}
//         style={{width: "100%", height: "100%"}}
//         useResizeHandler={true}
//       />
//     );
//   }
// }

ReactDOM.render(
  <App />,
  document.getElementById('root-islm')
);