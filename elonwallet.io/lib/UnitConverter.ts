export function toWei(amount: string, decimals: number = 18): string {
    let result = Array<string>();
    let decimalPlaces = 0;
    let shouldCount = false;
    for (let c of amount) {
        if (c === '.') {
            shouldCount = true;
            continue;
        }
        if (shouldCount) {
            decimalPlaces++;
        }
        result.push(c);
    }

    return result.join('').replace(/^0+/, '').concat('0'.repeat(decimals - decimalPlaces));
}

export function fromWei(amount: string, decimals: number = 18): string {
    let resultString = amount.padStart(decimals + 1, '0');
    const insertIndex = resultString.length - decimals;
    resultString = resultString.substring(0, insertIndex) + '.' + resultString.substring(insertIndex, resultString.length);

    return resultString.replace(/0+$/, '').replace(/\.$/, '');;
}