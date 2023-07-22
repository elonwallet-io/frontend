<template>
    <div class="w-9/12 m-auto mt-4">
        <div class="flex gap-4">
            <div class="w-8/12 flex flex-col gap-4">
                <AppBalanceCard @on-transaction="showSendTransaction = !showSendTransaction" />
                <AppSendTransactionCard v-if="showSendTransaction" @on-close="showSendTransaction = false" />
                <AppTransactionCard />
            </div>
            <div class="w-4/12 flex flex-col gap-4">
                <AppWalletsCard />
                <AppContactsCard />
            </div>
        </div>
    </div>
</template>

<script setup>
const showSendTransaction = ref(false);

onMounted(() => {
    (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
        k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
    })
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(94381507, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
    });
})
</script>