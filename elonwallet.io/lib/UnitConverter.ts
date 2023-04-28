import { formatUnits } from "ethers";

export function formatCurrency(amount: string, decimals: number, fractionDigits: number = -1): string {
    let value = BigInt(amount);

    if (fractionDigits > -1) {
        const remainder = value % BigInt("1".padEnd(fractionDigits, "0"))
        value -= remainder
    }

    return formatUnits(value, decimals);
}