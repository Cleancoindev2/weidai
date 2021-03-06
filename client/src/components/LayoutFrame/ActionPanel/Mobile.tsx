import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add'
import AssignmentReturned from '@material-ui/icons/AssignmentReturned'
import Timeline from '@material-ui/icons/Timeline'
import Computer from '@material-ui/icons/Computer'
import { Hidden } from '@material-ui/core';

const styles = {
	root: {
		flexGrow: 1,
	},
	grow: {
		flexGrow: 1,
	},
	menuButton: {
		marginLeft: -12,
		marginRight: 20,
		fontSize:12
	},
};

interface MobileProps {
	classes?: any
	goToEngine: () => void
	homePage: () => void,
	goToBank: () => void
}

function Mobile (props:MobileProps){
		const { classes } = props;
		return (
			<Hidden lgUp>
				<div className={classes.root}>
					<AppBar position="static">
						<Toolbar>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={props.goToEngine}>
								<AddIcon />&nbsp; Create / Claim
							</IconButton>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={props.goToBank}>
								<AssignmentReturned />&nbsp; Redeem
							</IconButton>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick ={props.homePage}>
								<Timeline />&nbsp; How it Works
							</IconButton>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={()=>{
								window.open('https://medium.com','_blank')
							}}>
							<Computer />&nbsp; Learn More
							</IconButton>
						</Toolbar>
					</AppBar>
				</div>
			</Hidden>
		);
}


export default withStyles(styles)(Mobile);