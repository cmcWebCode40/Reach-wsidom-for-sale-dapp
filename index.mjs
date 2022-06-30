import { loadStdlib, ask } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";

if (
	process.argv.length < 3 ||
	["seller", "buyer"].includes(process.argv[2]) == false
) {
	console.log("Usage: reach run index [seller|buyer]");
	process.exit(0);
}

const role = process.argv[2];

console.log(`Your Role is ${role}`);

const stdlib = loadStdlib(process.env);

const suStr = stdlib.standardUnit;

const toAU = (su) => stdlib.parseCurrency(su);

const toSU = (au) => stdlib.formatCurrency(au, 4);

const iBalance = toAU(1000);

const showBalance = async (acc) =>
	console.log(`Your balance is ${toSU(await stdlib.balanceOf(acc))} ${suStr}.`);

const commonInteract = (role) => ({
	reportCancellation: () => {
		console.log(
			`${role === "buyer" ? "You" : "The buyer"} cancelled the order`
		);
	},
	reportTransfer: (payment) => {
		console.log(
			`The contract paid ${toSU(payment)} ${suStr} to ${
				role == "seller" ? "you" : "the seller"
			}.`
		);
	},
	reportPayment: (payment) => {
		console.log(
			`${role == "buyer" ? "You" : "The buyer"} paid ${toSU(
				payment
			)} ${suStr} to the contract.`
		);
	},
});

// Seller

if (role === "seller") {
	const sellerinteract = {
		...commonInteract(role),
		price: toAU(5),
		reportReady: async (price) => {
			console.log(`Your wisdom is for slae at ${toSU(price)} ${suStr}.`);
			console.log(`Contract info :${JSON.stringify(await ctc.getInfo())}`);
		},
		wisdom: await ask.ask(
			"Enter a wise phrase, or press Enter for default:",
			(s) => {
				let w = !s ? "Build healthy communities." : s;
				if (!s) {
					console.log(w);
				}
				return w;
			}
		),
	};
	const acc = await stdlib.newTestAccount(iBalance);
	await showBalance(acc);
	const ctc = acc.contract(backend);
	await ctc.participants.Seller(sellerinteract);
	await showBalance(acc);
} else {
	// Buyer

	const buyerInteract = {
		...commonInteract(role),
		confirmPurchase: async (price) => {
			return await ask.ask(
				`Do you want to purchase wisdom for ${toSU(price)} ${suStr}?`,
				ask.yesno
			);
		},
		reportWisdom: (wisdom) => console.log(`Your new wisdom is "${wisdom}"`),
	};
	const acc = await stdlib.newTestAccount(iBalance);
	const info = await ask.ask("Paste contract info:", (s) => JSON.parse(s));
	const ctc = acc.contract(backend, info);
	const price = await ctc.views.Main.price();
	console.log(
		`The price of wisdom is ${
			price[0] == "None" ? "0" : toSU(price[1])
		} ${suStr}.`
	);
	await showBalance(acc);
	await ctc.p.Buyer(buyerInteract);
	await showBalance(acc);
}

ask.done();
