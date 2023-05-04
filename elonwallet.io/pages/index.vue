<template>
    <div class="w-9/12 m-auto mt-4">
        <div class="flex gap-4">
            <div class="w-8/12 flex flex-col gap-4">
                <IndexBalanceCard @on-transaction="showSendTransaction = !showSendTransaction" />
                <IndexSendTransactionCard v-if="showSendTransaction" @on-close="showSendTransaction = false" />
                <IndexTransactionCard />
            </div>
            <div class="w-4/12 flex flex-col gap-4">
                <IndexWalletsCard />
                <IndexContactsCard />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const showSendTransaction = ref(false);
</script>