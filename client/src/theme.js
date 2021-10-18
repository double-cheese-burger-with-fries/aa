// import { amber, green } from 'material-ui/colors';

import createMuiTheme from "@material-ui/core/es/styles/createMuiTheme";

const theme = createMuiTheme({
	typography: {
		useNextVariants: true,
	},

	// palette: {
	// 	primary: {
	// 		...amber,
	// 		500: '#c59e3f',
	// 	},
	// 	secondary: {
	// 		...green,
	// 		A200: '#00a651',
	// 		A400: '#00803e',
	// 	},
	// },
	// typography: {
	// 	fontFamily: 'Lato, sans-serif',
	// 	button: {
	// 		fontSize: '16px',
	// 	},
	// },
	// overrides: {
	// 	MuiDialogContent: {
	// 		root: {
	// 			padding: '0 26px 4px',
	// 		},
	// 	},
	// 	MuiGridListTile: {
	// 		tile: {
	// 			padding: '2px',
	// 		},
	// 	},
	// 	MuiChip: {
	// 		root: {
	// 			borderRadius: '10px',
	// 		},
	// 	},
	// },
});

export default theme;
