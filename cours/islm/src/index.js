import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist'// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

var Latex = require('react-latex');

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
		    	p: 100,
		    	p1: 1,
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
		    	ymax: 2500   		
	    	},
	    	eq: {
	    		y: 0,
	    		r: 0
	    	},
	    	values: {
	    		is: [],
	    		lm: []
	    	}
	    };
	    
	    this.handleChange = this.handleChange.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
	    this.get_curves = this.get_curves.bind
	}

	handleChange(event) {
		// const target = event.target;
		// const value = target.type === 'checkbox' ? target.checked : target.value;
		// const name = target.name;

		// this.setState({
		// 	params.name: value
		// })

		let partialState = Object.assign({}, this.state);
		partialState.params[event.target.name] = event.target.value;
		if(event.target.name === 'p'){
			partialState.params.p1 = event.target.value/100
		}
		this.setState({ partialState });

		this.computeEquilibrium();

	}

	computeEquilibrium() {
		const params = Object.assign({}, this.state.params);

		const denom = params.lr*(1-params.alpha-params.iy) + params.ir*params.ly
		const y = (-params.alpha*params.t+params.cpi+params.id*params.D/params.p1+params.bari+params.g)*params.lr+params.ir*params.Ms/params.p1;
		const r = params.Ms/params.p1*(1-params.alpha-params.iy) - params.ly*(-params.alpha*params.t+params.cpi+params.id*params.D/params.p1+params.bari+params.g);

		this.setState({
			eq: {
				y: y/denom,
				r: r/denom
			}
		})
		// console.log("y:",y/denom,"r:",r,"denom",denom);
	}

	get_curves() {

	}

	render() {
		return (
      		<div id = "page-wrapper">
				<div className="row">
				    <div className="block-3">
						<h1>Le modèle IS LM</h1>
				    	<div id="settings">
				    		<h4><u>Paramètres globaux</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$p:$</Latex>
								          <input name="p" value={this.state.params.p} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$y$ max:</Latex>
								          <input name="ymax" value={this.state.params.ymax} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Paramètres de IS</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$\alpha:$</Latex>
								          <input name="alpha" value={this.state.params.alpha} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$I_y:$</Latex>
								          <input name="iy" value={this.state.params.iy} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$I_r:$</Latex>
								          <input name="ir" value={this.state.params.ir} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$I_D:$</Latex>
								          <input name="id" value={this.state.params.id} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$C_\pi:$</Latex>
								          <input name="cpi" value={this.state.params.cpi} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$I_0:$</Latex>
								          <input name="bari" value={this.state.params.bari} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$g:$</Latex>
								          <input name="g" value={this.state.params.g} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$t:$</Latex>
								          <input name="t" value={this.state.params.t} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Paramètres de LM</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$L_y:$</Latex>
								          <input name="ly" value={this.state.params.ly} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$L_r:$</Latex>
								          <input name="lr" value={this.state.params.lr} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$M^s:$</Latex>
								          <input name="Ms" value={this.state.params.Ms} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <Latex>$r_0:$</Latex>
								          <input name="rmin" value={this.state.params.rmin} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
					    </div>
				    </div>
				    <div className="block-9">
				    	<div  id="model">
					        <Diag data={this.state.data}/>
					    </div>
				    </div>
				    
				</div>
      		</div>
		)
	}
}

// class Params extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {value: ''};

//     this.handleChange = this.handleChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }

//   handleChange(event) {
//     this.setState({value: event.target.value});
//   }

//   handleSubmit(event) {
//     alert('A name was submitted: ' + this.state.value);
//     event.preventDefault();
//   }

//   render() {
//     return (

//     );
//   }
// }

class Diag extends React.Component {
	constructor(props) {
		super(props)
		this.trace1 = {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: 'scatter',
            mode: 'lines+markers',
            name: props.name,
            marker: {color: 'red'},
          }
        this.trace2 = {
            x: [1, 2, 3],
            y: [1, 8, 3],
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'blue'},
          }
		this.state = {
			data: [this.trace1,this.trace2], 
			layout: {
				autosize: true
			}
		}
	}

  render() {
    return (
      <Plot
        data={this.state.data}
        layout={this.state.layout}
        style={{width: "100%", height: "100%"}}
        useResizeHandler={true}
      />
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);