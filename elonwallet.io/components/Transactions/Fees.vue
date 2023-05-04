<template>
    <div class="p-2">
        <h3 class="text-xl my-2">Estimated Fees</h3>
        <v-table>
            <thead>
                <tr>
                    <th>
                        Fee Type
                    </th>
                    <th>
                        Amount in {{ network!.currency }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Maximum Fee</td>
                    <td>{{ maxFee }}</td>
                </tr>
                <tr>
                    <td>Base Fee</td>
                    <td>{{ baseFee }}</td>
                </tr>
                <tr>
                    <td>Tip</td>
                    <td>{{ tip }}</td>
                </tr>
            </tbody>
        </v-table>
    </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/lib/UnitConverter';
const wallet = useCurrentWallet();
const network = useCurrentNetwork()

const { fees, refresh } = useFees();
let interval = 0;

onMounted(async () => {
    interval = window.setInterval(async () => {
        await refresh();
    }, 10000,);
})

onUnmounted(async () => {
    window.clearInterval(interval);
})

watch([wallet, network], async () => {
    await refresh();
})

const maxFee = computed(() => {
    return formatCurrency(fees.value?.estimated_fees ?? "0", network.value.decimals, 8);
})

const baseFee = computed(() => {
    return formatCurrency(fees.value?.base_fee ?? "0", network.value.decimals, 8);
})

const tip = computed(() => {
    return formatCurrency(fees.value?.tip ?? "0", network.value.decimals, 8);
})
</script>