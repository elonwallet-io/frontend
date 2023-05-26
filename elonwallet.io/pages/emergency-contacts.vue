<template>
    <div class="flex flex-col gap-8 items-center mt-20">
        <div class="w-3/5 p-2 bg-white shadow-md rounded-md">
            <div class="flex justify-between items-center">
                <span class="font-bold">My Emergency Contacts</span>
                <DialogEmergencyContactForm" :emergency-contacts="emergencyContacts ?? []"
                    @contact-created="refreshContacts" />
            </div>
            <EmergencyContactsList :contacts="emergencyContacts ?? []" @on-contacts-changed="refreshContacts" />
        </div>
        <div class="w-3/5 p-2 bg-white shadow-md rounded-md">
            <span class="font-bold">My Emergency Access Grants</span>
            <EmergencyAccessGrantsList :grants="emergencyAccessGrants ?? []" @on-grants-changed="refreshGrants" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { emergencyContacts, refresh: refreshContacts } = useEmergencyContacts();
const { emergencyAccessGrants, refresh: refreshGrants } = useEmergencyAccessGrants();
</script>