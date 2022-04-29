import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
// import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
// import createPlotlyComponent from "react-plotly.js/factory";
import {InlineMath} from 'react-katex';
import * as ss from 'simple-statistics'

// const Plot = createPlotlyComponent(Plotly);

const steps = {
  "g": 0.01,
  "delta": 0.01,
  "alpha": 0.01,
  "beta": 0.01,
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        params: {
          "g": 0.02,
          "delta": 0.03,
          "alpha": 0.3,
          "beta": 0.3,
        }
      };

      this.handleChange = this.handleChange.bind(this);
      this.computeRegression = this.computeRegression.bind(this);
  }

  componentDidMount() {
    this.computeRegression();
  }

  handleChange(event) {
    let partialState = Object.assign({}, this.state);
    partialState.params[event.target.name] = parseFloat(event.target.value);
    this.setState(partialState, function() {
      this.computeRegression();
    });
  }

  computeRegression() {
    console.log(ss.linearRegression([[0, 0], [1, 1]]))
  }

  render() {
    return (
      <div id = "page-wrapper">
        <h1>Cross-country growth regressions</h1>
        <div className="row">
          <div className="block-2">
            <div id="settings">
            <h4><u>Technical growth and capital stock depreciation</u></h4>
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
                    <InlineMath math="\delta" />
                    <input name="delta" value={this.state.params.delta} step={steps.delta} className="entry-form" type="number" onChange={this.handleChange} />
                  </label>
                </div>
              </div>
            </div>
            <h4><u>Production Function</u></h4>
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
                      <InlineMath math="\beta" />
                      <input name="beta" value={this.state.params.beta} step={steps.beta} className="entry-form" type="number" onChange={this.handleChange} />
                    </label>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div className="block-10">
            <div id="regression">
                <h3><u>Regression results</u></h3>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


const container = document.getElementById('root-mankiw-et-al_1992');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App tab="home" />);

