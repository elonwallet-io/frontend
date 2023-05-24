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
import { EmergencyAccessContact, EmergencyAccessGrant } from '~/lib/types';

const { emergencyContacts, refresh: refreshContacts } = useEmergencyContacts();
const { emergencyAccessGrants, refresh: refreshGrants } = useEmergencyAccessGrants();

/*
const emergencyContacts = ref<EmergencyAccessContact[]>([
    {
        email: "test@example.com",
        enclave_url: "123.com",
        has_accepted: true,
        has_requested_takeover: true,
        notification_series_id: "0",
        takeover_allowed_after: 1684922449,
        waiting_period_in_days: 0
    },
    {
        email: "test@example.com",
        enclave_url: "123.com",
        has_accepted: false,
        has_requested_takeover: false,
        notification_series_id: "0",
        takeover_allowed_after: 0,
        waiting_period_in_days: 0
    },
    {
        email: "test@example.com",
        enclave_url: "123.com",
        has_accepted: true,
        has_requested_takeover: true,
        notification_series_id: "0",
        takeover_allowed_after: 1687922449,
        waiting_period_in_days: 0
    }
])

const emergencyAccessGrants = ref<EmergencyAccessGrant[]>([
    {
        email: "test@example.com",
        enclave_url: "123.com",
        has_accepted: false,
        has_requested_takeover: false,
        notification_series_id: "0",
        takeover_allowed_after: 0,
    },
    {
        email: "test2@example.com",
        enclave_url: "123.com",
        has_accepted: true,
        has_requested_takeover: false,
        notification_series_id: "0",
        takeover_allowed_after: 0,
    },
    {
        email: "test3@example.com",
        enclave_url: "123.com",
        has_accepted: true,
        has_requested_takeover: true,
        notification_series_id: "0",
        takeover_allowed_after: 1684922449,
    },
    {
        email: "test4@example.com",
        enclave_url: "123.com",
        has_accepted: true,
        has_requested_takeover: true,
        notification_series_id: "0",
        takeover_allowed_after: 1687922449,
    }
])
*/
</script>