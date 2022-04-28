// Resources:
// Nice table and example for parsing data: https://codesandbox.io/s/how-to-parse-or-read-csv-files-in-reactjs-ssr5s2?from-embed=&file=/src/App.js
// How to use Papa.parse See https://medium.com/how-to-react/how-to-parse-or-read-csv-files-in-reactjs-81e8ee4870b0
// For the callback: https://stackoverflow.com/questions/26266459/retrieve-parsed-data-from-csv-in-javascript-object-using-papa-parse
import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';
// import * as ss from 'simple-statistics'
import {inv,add,sqrt,mean,diag,subset,matrix,index,range,multiply,ones,transpose} from 'mathjs';

const Papa = require("papaparse/papaparse.min.js");

const Plot = createPlotlyComponent(Plotly);

const steps = {
  "g": 0.01,
  "delta": 0.01,
  "alpha": 0.01,
  "beta": 0.01,
}

const gdp_points = [3178.182,3259.97075,3343.54675,3548.4085,3702.94325,3916.2795,4170.74975,4445.853,4567.78075,4792.31475,4942.067,4951.2615,5114.3245,5383.28175,5687.20675,5656.465,5644.843,5948.995,6224.0865,6568.60825,6776.58,6759.18075,6930.71025,6805.758,7117.72875,7632.81225,7951.074,8226.3915,8510.99,8866.49875,9192.134,9365.494,9355.35475,9684.89175,9951.5025,10352.43175,10630.3205,11031.34975,11521.93825,12038.283,12610.49125,13130.9865,13262.07925,13493.0645,13879.1285,14406.3825,14912.50875,15338.25675,15626.0295,15604.6875,16197.0075,16495.3695,16912.03775,17432.17,17730.5085,18144.10475,18687.786,19091.66225]

const cap_points = [14239.895,14711.917,15205.273,15759.578,16361.41,17023.688,17752.528,18530.992,19263.544,20015.188,20760.19,21404.616,22058.784,22805.318,23631.742,24335.552,24870.554,25504.854,26279.792,27203.124,28174.17,28983.3,29770.398,30400.94,31125.588,32101.15,33160.38,34217.176,35245.904,36263.696,37283.484,38223.836,38987.08,39793.464,40663.208,41620.812,42632.688,43758.388,44977.192,46345.16,47827.896,49368.264,50734.812,51925.832,53184,54572.832,56084.492,57575.292,58915.288,59981.816,62435.628,63232.936,64124.208,65057.808,65974.06,66942.704,68007.352,69059.064]


class App extends React.Component {
  constructor(props) {
    super(props);
    this.filesInput = React.createRef();
    this.state = {
        params: {
          "g": 0.02,
          "delta": 0.03,
          "alpha": 0.3,
          "beta": 0.3,
        },
        variables: "collapse",
        database: undefined,
        data: [
          {
            x: [],
            y: [],// u
            type: 'scatter',
            mode: 'lines+markers',
            name: "regression",
            line: {
              color: "black"
            },
            hovertemplate: 
              'y: %{x:.0f}' +
              '<br>u: %{y:.2f}' +
              '<extra></extra>'
          },
          {
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            name: 'GDP ~ Cap',
            marker: { 
              size: 12
            },
            hovertemplate: 
              'y: %{x:.0f}' +
              '<br>w: %{y:.2f}' +
              '<extra></extra>'
          }
        ],
        layout: {
          autosize: true,
          showlegend: true,
          legend: {
            x: 1,
            xanchor: 'right',
            y: 0
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
          xaxis: {
            title: '',
            titlefont: {
                  family: 'Arial, sans-serif',
                  size: 18,
                  color: '#333'
              },
          range: []
          },
          yaxis: {
            title: "",
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
      this.updateData = this.updateData.bind(this);
      this.chooseVars = this.chooseVars.bind(this);
      this.computeRegression = this.computeRegression.bind(this);
  }

  componentDidMount() {
    // this.computeRegression();
  }

  handleChange(event) {
    let partialState = Object.assign({}, this.state);
    partialState.params[event.target.name] = parseFloat(event.target.value);
    this.setState(partialState, function() {
      this.computeRegression();
    });
  }

  importCSV(event, callback){
    Papa.parse(event.target.files[0], {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: function(results) {    
        callback(results)
      }
    });
  };

  updateData(results){
    var keys = [];
    var data = [];

    // Iterating data to get column name and their values
    results.data.map((d) => {
      keys.push(Object.keys(d));
      data.push(Object.values(d));
    });

    keys = keys[0]

    this.setState({
      database: data,
      keys: keys,
      variables: ""
    }, function() {
      // The next step should be to display the different column names and give the possibility of choosing the role of each column (indepent / dependent variable)
      // Eventually give more options, like the kind of fit you want, the form of the model, etc.
      // Also display a new button to compute the regression after the choice has been made
      this.chooseVars();
    }); 
  }

  chooseVars() {
    console.log(this.state.database,this.state.keys)
  }

  computeRegression() {
    var n = cap_points.length
    var Y = cap_points
    var tX = [Array(n).fill(1),gdp_points]

    // var n = this.state.database.length
    // var Y = subset(this.state.database, index(range(0,n),0))[0]
    // var tX = [Array(n).fill(1),subset(this.state.database, index(range(0,n),1))[0]]

    var X = transpose(tX)
    var p = X[0].length

    var Sxx = inv(multiply(tX,X))
    var beta = multiply(multiply(Sxx,tX),cap_points)

    var Yhat = multiply(X,beta)
    var Ybar = mean(Y)

    var ssr = Y.reduce((pV,cV) => pV + (cV - Yhat)^2)
    var sst = Y.reduce((pV,cV) => pV + (cV - Ybar)^2)
    var Rsquare = 1 - ssr/sst


    var Vbeta_hat = multiply(ssr/(n-p), diag(Sxx))
    var std_err = sqrt(Vbeta_hat)
    // console.log(std_err)

    let partialState = Object.assign({}, this.state);
    partialState.data[0].x = subset(tX, index(1,range(0,n)))[0];
    partialState.data[0].y = Yhat;

    // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
    const newLayout = Object.assign({}, this.state.layout);
    newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
    this.setState({
      data: partialState.data,
      layout: newLayout
    })


    // console.log(beta)

  }

  render() {
    return (
      <div id = "page-wrapper">
        <h1>Simple OLS Regression</h1>
        <div className="row">
          <div className="block-5">
            <div id="settings">
              <div className="row">
                <input
                  className="csv-input"
                  type="file"
                  ref={input => {
                    this.filesInput = input;
                  }}
                  name="file"
                  placeholder={null}
                  onChange={(e) => this.importCSV(e,this.updateData)}
                />
              </div>
            </div>
            <div id="variables" className={this.state.variables}>
              <button id="reg_btn" className="btn" name="regress" onClick={this.computeRegression}>Regress!</button>
            </div>
          </div>
          <div className="block-7">
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


const container = document.getElementById('root-ols-regression');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App tab="home" />);

