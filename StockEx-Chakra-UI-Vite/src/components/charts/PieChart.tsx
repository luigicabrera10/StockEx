// import React from 'react';
// import ReactApexChart from 'react-apexcharts';

// type ChartProps = {
// 	// using `interface` is also ok
// 	[x: string]: any;
// };
// type ChartState = {
// 	chartData: any[];
// 	chartOptions: any;
// };

// class PieChart extends React.Component<ChartProps, ChartState> {
// 	constructor(props: { chartData: any[]; chartOptions: any }) {
// 		super(props);

// 		this.state = {
// 			chartData: [],
// 			chartOptions: {}
// 		};
// 	}

// 	componentDidMount() {
// 		this.setState({
// 			chartData: this.props.chartData,
// 			chartOptions: this.props.chartOptions
// 		});
// 	}

// 	render() {
// 		return (
// 			<ReactApexChart
// 				options={this.state.chartOptions}
// 				series={this.state.chartData}
// 				type='pie'
// 				width='100%'
// 				height='65%'
// 			/>
// 		);
// 	}
// }

// export default PieChart;


import React from 'react';
import ReactApexChart from 'react-apexcharts';

type ChartProps = {
	chartData: any[];
	chartOptions: any;
};

type ChartState = {
	chartData: any[];
	chartOptions: any;
};

class PieChart extends React.Component<ChartProps, ChartState> {
	constructor(props: ChartProps) {
		super(props);

		this.state = {
			chartData: props.chartData,
			chartOptions: props.chartOptions,
		};
	}

	componentDidUpdate(prevProps: ChartProps) {
		// Only update if the props have changed
		if (prevProps.chartData !== this.props.chartData || prevProps.chartOptions !== this.props.chartOptions) {
			this.setState({
				chartData: this.props.chartData,
				chartOptions: this.props.chartOptions,
			});
		}
	}

	render() {
		return (
			<ReactApexChart
				options={this.state.chartOptions}
				series={this.state.chartData}
				type='pie'
				width='100%'
				height='65%'
			/>
		);
	}
}

export default PieChart;
