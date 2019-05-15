
import { Observable } from 'rxjs'
import Web3 from "web3";

export interface EffectFactoryType {
	(action: (account: string) => Promise<string>): Effect
}

export const EffectFactory = (web3: Web3): EffectFactoryType => (

	( action: (account: string) => Promise<string>): Effect => {
		const subscription = web3.eth.subscribe("newBlockHeaders")
		const observable = Observable.create((observer) => {
			subscription.on('data', async () => {
				let account = (await web3.eth.getAccounts())[0]
				const currentResult = await action(account)
					observer.next(currentResult)
				
			})
		})
		return new Effect(observable, subscription)
	}
)

export class Effect {
	private subscription: any
	public Observable: Observable<string>
	public constructor(Observable: Observable<string>, subscription: any) {
		this.subscription = subscription
		this.Observable = Observable
	}

	cleanup() {
		if (this.subscription !== null && this.subscription.id !== null)
			this.subscription.unsubscribe()
	}
}