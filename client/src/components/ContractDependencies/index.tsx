import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { Grid, Checkbox, TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'
import NewGroupDialog from './NewGroupDialog';
import OwnershipTransfer from './OwnershipTransfer'
import { WalletContext } from '../Contexts/WalletStatusContext'

interface contractGroup {
	weiDai: string
	dai: string
	patienceRegulationEngine: string
	weiDaiBank: string
	enabled: boolean
	name: string
	claimWindowsPerAdjustment: number
	donationAddress: string
	version: number
	originalValues?: contractGroup
}

const emptyGroup: contractGroup = {
	weiDai: "loading...",
	dai: "loading...",
	patienceRegulationEngine: "loading...",
	weiDaiBank: "loading...",
	enabled: false,
	name: "loading...",
	claimWindowsPerAdjustment: 0,
	donationAddress: "loading...",
	version: 0
}

interface props {
	children?: any
}

export default function (props: props) {
	const walletContextProps = useContext(WalletContext)
	const options = { from:walletContextProps.account }
	if (!walletContextProps.initialized)
		return <div></div>
	const [refresh, setRefresh] = useState<number>(0)
	const [oldRefresh, setOldRefresh] = useState<number>(-1)
	const [activeVersion, setActiveVersion] = useState<string>(walletContextProps.contracts.activeVersion)
	const [oldActiveVesion, setOldActiveVersion] = useState<string>(activeVersion)
	const [versionArray, setVersionArray] = useState<string[]>([])
	const [defaultVersion, setDefaultVersion] = useState<string>("")
	const [group, setGroup] = useState<contractGroup>(emptyGroup)
	const [dialogOpen, setDialogOpen] = useState<boolean>(false)
	const [donationBalance, setDonationBalance] = useState<number>(0)

	useEffect(() => {
		const effect = API.weiDaiEffects.balanceOfEffect(walletContextProps.contracts.WeiDaiBank.address)
		const subscription = effect.Observable.subscribe((balance) => {
			setDonationBalance(balance)
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	const populateArray = async () => {
		let array = await API.populateVersionArray(walletContextProps.contracts,options);
		setVersionArray(array)
	}

	useEffect(() => {
		const loadData = async () => {
			setActiveVersion(walletContextProps.contracts.activeVersion)
			if (oldActiveVesion !== activeVersion) {
				setOldActiveVersion(walletContextProps.contracts.activeVersion)
				location.reload()
			}
			populateArray()

			const defaultVersionHex = await walletContextProps.contracts.VersionController.getDefaultVersion().call(options)
			setDefaultVersion("" + API.hexToNumber(defaultVersionHex))
			const weiDaiAddress = await walletContextProps.contracts.VersionController.getWeiDai(activeVersion).call(options)

			const daiAddress = await walletContextProps.contracts.VersionController.getDai(activeVersion).call(options)
			const preAddress = await walletContextProps.contracts.VersionController.getPRE(activeVersion).call(options)
			const bankAddress = await walletContextProps.contracts.VersionController.getWeiDaiBank(activeVersion).call(options)
			const groupNameBytes: string = await walletContextProps.contracts.VersionController.getContractFamilyName(activeVersion).call(options)
			let groupName = ""
			for (let i = 0; i < groupNameBytes.length; i++) {
				if (groupNameBytes.charCodeAt(i) !== 0)
					groupName += groupNameBytes.charAt(i)
			}
			const claimWindowsPerAdjustment = await walletContextProps.contracts.PRE.getClaimWindowsPerAdjustment().call(options)
			const donationAddress = await walletContextProps.contracts.WeiDaiBank.getDonationAddress().call(options)
			const enabled = await walletContextProps.contracts.VersionController.isEnabled(activeVersion).call(options)

			const contractGroup: contractGroup = {
				weiDai: weiDaiAddress,
				dai: daiAddress,
				weiDaiBank: bankAddress,
				name: groupName,
				patienceRegulationEngine: preAddress,
				claimWindowsPerAdjustment,
				donationAddress,
				enabled,
				version: parseInt(activeVersion),
				originalValues: {
					weiDai: weiDaiAddress,
					dai: daiAddress,
					weiDaiBank: bankAddress,
					name: groupName,
					patienceRegulationEngine: preAddress,
					claimWindowsPerAdjustment,
					donationAddress,
					enabled,
					version: parseInt(activeVersion)
				}
			}
			setGroup(contractGroup)
		}
		if (oldRefresh !== refresh) {
			setOldRefresh(refresh)
			loadData()
		}
	})

	const updateWeiDai = (newValue: string) => {
		group.weiDai = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateDai = (newValue: string) => {
		group.dai = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateBank = (newValue: string) => {
		group.weiDaiBank = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateClaimWindowsPerAdjustment = (newValue: string) => {
		const num = parseFloat(newValue)
		if (!isNaN(num)) {

			group.claimWindowsPerAdjustment = num
			const newGroup = { ...group }
			setGroup(newGroup)
		}
	}

	const updateDonationAddress = (newValue: string) => {
		group.donationAddress = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateEnabled = (newValue: boolean) => {
		group.enabled = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateName = (newValue: string) => {
		if (newValue.length <= 16) {
			group.name = newValue
			const newGroup = { ...group }
			setGroup(newGroup)
		}
	}

	const updatePatienceRegulationEngine = (newValue: string) => {
		group.patienceRegulationEngine = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateRow = () => {
		const currentGroup = group
		const originalValues = currentGroup.originalValues || null;
		if (originalValues === null)
			return;
		if (currentGroup.claimWindowsPerAdjustment !== originalValues.claimWindowsPerAdjustment) {
			walletContextProps.contracts.PRE.setClaimWindowsPerAdjustment("" + currentGroup.claimWindowsPerAdjustment).send(options)
		}
		if (currentGroup.donationAddress !== originalValues.donationAddress) {
			walletContextProps.contracts.WeiDaiBank.setDonationAddress(currentGroup.donationAddress).send(options)
		}

		if (currentGroup.dai !== originalValues.dai || currentGroup.weiDai !== originalValues.weiDai || currentGroup.patienceRegulationEngine !== originalValues.patienceRegulationEngine ||
			currentGroup.version !== originalValues.version || currentGroup.weiDaiBank !== originalValues.weiDaiBank ||
			currentGroup.name !== originalValues.name || currentGroup.enabled !== originalValues.enabled) {
			walletContextProps.contracts.VersionController.setContractGroup("" + currentGroup.version, currentGroup.weiDai, currentGroup.dai,
				currentGroup.patienceRegulationEngine, currentGroup.weiDaiBank, API.toBytes(currentGroup.name), currentGroup.enabled).send(options)
		}


	}

	const createNewGroup = async (weiDai: string, dai: string, pre: string, bank: string, name: string, version: string) => {
		await walletContextProps.contracts.VersionController.setContractGroup(version, weiDai, dai, pre, bank, API.toBytes(name), true).send(options)
	}
	const nextVersion: string = `${parseInt(versionArray[versionArray.length - 1]) + 1}`
	return <div>
		<NewGroupDialog isOpen={dialogOpen} close={() => { setDialogOpen(false) }} submit={createNewGroup} versionNumber={nextVersion} />
		<Grid container
			direction="column"
			alignContent="center"
			justify="flex-start"
			spacing={3}>
			<Grid>
				<Button variant="contained" color="secondary" onClick={() => { setRefresh(refresh + 1); setGroup(emptyGroup); }}>Refresh Page</Button>
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					alignItems="flex-start"
					justify="space-evenly"
					spacing={3}>
					<Grid key="Wei" item><TextField label="WeiDai" value={group.weiDai} onChange={(event) => { updateWeiDai(event.target.value) }} /></Grid>
					<Grid key="dai" item><TextField label="Dai" value={group.dai} onChange={(event => { updateDai(event.target.value) })} /></Grid>
					<Grid key="pre" item><TextField label="PRE" value={group.patienceRegulationEngine} onChange={(event => { updatePatienceRegulationEngine(event.target.value) })} /></Grid>
					<Grid key="bank" item><TextField label="Bank" value={group.weiDaiBank} onChange={(event => { updateBank(event.target.value) })} /></Grid>
					<Grid key="Name" item><TextField label="Name" value={group.name} onChange={(event => { updateName(event.target.value) })} /></Grid>
					<Grid key="don" item><TextField label="DonationAddress" value={group.donationAddress} onChange={(event => { updateDonationAddress(event.target.value) })} /></Grid>
					<Grid key="claim" item><TextField label="ClaimWindowsPerAdjustment" value={group.claimWindowsPerAdjustment} onChange={(event => { updateClaimWindowsPerAdjustment(event.target.value) })} /></Grid>
					<Grid key="ena" item><Checkbox checked={group.enabled} onChange={(event => { updateEnabled(event.target.checked) })}></Checkbox>Enabled</Grid>
					<Grid key="up" item><Button color="primary" variant="contained" onClick={() => updateRow()}>Update row</Button>
						<Grid key="donationBalance">
							<Typography variant="subtitle1" gutterBottom>
								Unclaimed donations: {donationBalance}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					alignItems="center"
					justify="flex-start"
					spacing={7}>
					<Grid item>
						<FormControl>
							<InputLabel htmlFor="active-version">Active version</InputLabel>
							<Select
								value={activeVersion}
								inputProps={{
									name: "activeVersionDropDown",
									id: "active-version"
								}}
								onChange={(event: React.ChangeEvent<{ name?: string; value: string }>) => { setActiveVersion(event.target.value) }}
							>
								{
									versionArray.map((version: string) => (
										<MenuItem key={version} value={version}>{version}</MenuItem>
									))
								}
							</Select>
						</FormControl>
					</Grid>
					<Grid item>
						<Button color="primary" variant="contained" onClick={async () => {
							await walletContextProps.contracts.VersionController.setActiveVersion(activeVersion).send(options)
						}}>Set Active Version for this User</Button>
					</Grid>
				</Grid>
				<Grid item>
					<Grid container
						direction="row"
						alignItems="center"
						justify="flex-start"
						spacing={7}>
						<Grid item>
							<FormControl>
								<InputLabel htmlFor="default-version">Default version</InputLabel>
								<Select
									value={defaultVersion}
									inputProps={{
										name: "defaultVersionDropDown",
										id: "default-version"
									}}
									onChange={(event: React.ChangeEvent<{ name?: string; value: string }>) => { setDefaultVersion(event.target.value) }}
								>
									{
										versionArray.map((version: string) => (
											<MenuItem key={version} value={version}>{version}</MenuItem>
										))
									}
								</Select>
							</FormControl>
						</Grid>
						<Grid item>
							<Button color="primary" variant="contained" onClick={async () => {
								await walletContextProps.contracts.VersionController.setDefaultVersion(defaultVersion).send(options)
							}}>Set Default Version</Button>
						</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<Button color="secondary" variant="contained" onClick={() => setDialogOpen(true)}>Add a new group</Button>
				</Grid>
			</Grid>
		</Grid>
		<OwnershipTransfer />
	</div>
}